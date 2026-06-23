import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ShippingData {
  cep: string;
  address: AddressData | null;
  shippingPrice: number;
  shippingCalculated: boolean;
}

interface CheckoutContextValue {
  cep: string;
  setCep: (value: string) => void;
  address: AddressData | null;
  shippingPrice: number;
  shippingCalculated: boolean;
  isLoading: boolean;
  clearShipping: () => void;
  calculateShipping: () => Promise<boolean>;
}

const STORAGE_KEY = 'checkout_shipping';

const emptyShippingData: ShippingData = {
  cep: '',
  address: null,
  shippingPrice: 0,
  shippingCalculated: false,
};

function readStoredShippingData(): ShippingData {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) return emptyShippingData;

    const parsed = JSON.parse(storedValue) as ShippingData;

    if (!parsed.cep || !parsed.address) return emptyShippingData;

    return {
      cep: parsed.cep,
      address: parsed.address,
      shippingPrice: Number(parsed.shippingPrice) || 0,
      shippingCalculated: Boolean(parsed.shippingCalculated),
    };
  } catch {
    return emptyShippingData;
  }
}

function calculateShippingPrice(cep: string) {
  const startsWithNortheastPrefix = /^6[0-2]/.test(cep);

  return startsWithNortheastPrefix ? 19.9 : 29.9;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shippingData, setShippingData] = useState<ShippingData>(readStoredShippingData);
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearShipping = useCallback(() => {
    setShippingData(emptyShippingData);
    setCep('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const calculateShipping = useCallback(async () => {
    const cepDigits = cep.replace(/\D/g, '');

    if (cepDigits.length !== 8) {
      clearShipping();
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);

      if (!response.ok) {
        clearShipping();
        return false;
      }

      const cepData = await response.json();

      if (cepData.erro) {
        clearShipping();
        return false;
      }

      const address: AddressData = {
        cep: cepData.cep,
        street: cepData.logradouro ?? '',
        neighborhood: cepData.bairro ?? '',
        city: cepData.localidade ?? '',
        state: cepData.uf ?? '',
      };
      const shippingPrice = calculateShippingPrice(cepDigits);
      const nextShippingData: ShippingData = {
        cep: cepDigits,
        address,
        shippingPrice,
        shippingCalculated: true,
      };

      setShippingData(nextShippingData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextShippingData));

      return true;
    } catch {
      clearShipping();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cep, clearShipping]);

  const value = useMemo(
    () => ({
      cep,
      setCep,
      address: shippingData.address,
      shippingPrice: shippingData.shippingPrice,
      shippingCalculated: shippingData.shippingCalculated,
      isLoading,
      clearShipping,
      calculateShipping,
    }),
    [calculateShipping, cep, clearShipping, shippingData.address, shippingData.shippingCalculated, shippingData.shippingPrice, isLoading],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }

  return context;
}

export type { AddressData, ShippingData };
