import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';

export type CartItem = Product & {
  quantity: number;
};

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  total: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CART_STORAGE_KEY = 'americanas_cart';

function readStoredCart(): CartItem[] {
  try {
    const storedValue = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedValue) return [];

    const parsedItems = JSON.parse(storedValue) as CartItem[];

    return parsedItems.filter((item) => item && typeof item.id === 'number' && item.quantity > 0);
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [cartOpen, setCartOpen] = useState(false);

  const totalItems = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const total = subtotal;

  const addToCart = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const increaseQuantity = (id: number) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  };

  const decreaseQuantity = (id: number) => {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== id) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => {
    setCartOpen(true);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        subtotal,
        total,
        cartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
