import { ArrowLeft, Lock, Mail, User, Phone, Package, CreditCard, MapPin, Truck, Minus, Plus, X, Check, Gift, Smartphone, Radio, ChevronDown, HelpCircle, Loader2, ChevronRight, Plus as PlusIcon, QrCode, Wallet, Smartphone as SmartphoneIcon, Home, Pencil } from "lucide-react";
import { FormEvent, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCheckout } from "../context/CheckoutContext";
import { formatCPF, validateCPF } from "../utils/cpf";
import { CheckoutFooter } from "../components/CheckoutFooter";
import { createOrder } from "../data/ordersStorage";

type CheckoutStep = 'profile' | 'delivery' | 'payment';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex h-[36px] items-center overflow-hidden rounded-lg border border-[#e3e3e3] bg-white text-[#212121]">
      <button className="grid h-full w-9 place-items-center" type="button" onClick={onDecrease} aria-label="Diminuir quantidade">
        <Minus size={16} strokeWidth={2.4} />
      </button>
      <span className="min-w-[34px] px-2 text-center text-sm font-normal">{quantity}</span>
      <button className="grid h-full w-9 place-items-center" type="button" onClick={onIncrease} aria-label="Aumentar quantidade">
        <Plus size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}

const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

const currentYear = new Date().getFullYear();
const years: string[] = [];
for (let year = currentYear; year <= 2076; year++) {
  years.push(String(year));
}

export default function CheckoutProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, subtotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { address, shippingPrice, shippingCalculated, cep, setCep, clearShipping, calculateShipping, isLoading: shippingLoading } = useCheckout();
  const emailFromState = (location.state as { email?: string } | undefined)?.email;

  // Entrega — estados locais
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [localAddress, setLocalAddress] = useState<{ street: string; neighborhood: string; city: string; state: string; cep: string } | null>(null);
  const [localShippingPrice, setLocalShippingPrice] = useState<number | null>(null);
  const addressCardRef = useRef<HTMLDivElement>(null);

  const generateShippingPrice = () => {
    const value = Math.random() * (29.9 - 8.9) + 8.9;
    return Number(value.toFixed(2));
  };

  // Dados pessoais — estados locais
  const [profileEmail, setProfileEmail] = useState(emailFromState || '');
  const [profileName, setProfileName] = useState('');
  const [profileSurname, setProfileSurname] = useState('');
  const [profileCpf, setProfileCpf] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDataSaved, setProfileDataSaved] = useState(false);

  // Nome completo derivado dos dados pessoais
  const fullName = `${profileName} ${profileSurname}`.trim();

  // Sincroniza o destinatário com o nome do perfil quando o perfil muda
  // (apenas se o usuário não editou manualmente ou ao avançar etapa)
  useEffect(() => {
    if (profileDataSaved) {
      setRecipientName(fullName);
    }
  }, [profileName, profileSurname, profileDataSaved, fullName]);

  const safeSubtotal = typeof subtotal === 'number' ? subtotal : 0;
  const displayShippingPrice = localShippingPrice ?? (typeof shippingPrice === 'number' ? shippingPrice : 0);
  const total = safeSubtotal + displayShippingPrice;

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('profile');
  const [cepError, setCepError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'pix' | 'americanas-card' | 'google-pay'>('credit-card');
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiryMonth, setCardExpiryMonth] = useState('');
  const [cardExpiryYear, setCardExpiryYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCpf, setCardCpf] = useState('');
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [cardCpfError, setCardCpfError] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCards, setGiftCards] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const handleCepSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCepError('');

    const cepDigits = cep.replace(/\D/g, '');

    if (cepDigits.length !== 8) {
      setCepError('CEP inválido. Digite 8 números.');
      return;
    }

    setLoadingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);

      if (!response.ok) {
        setCepError('Erro ao buscar CEP. Tente novamente.');
        setLocalAddress(null);
        return;
      }

      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
        setLocalAddress(null);
        return;
      }

      setLocalAddress({
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
        cep: data.cep ?? '',
      });
      setLocalShippingPrice(generateShippingPrice());
      setCepError('');
    } catch {
      setCepError('Erro ao buscar CEP. Tente novamente.');
      setLocalAddress(null);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextCep = e.target.value;
    setCep(nextCep);
    setCepError('');

    if (nextCep.replace(/\D/g, '').length !== 8) {
      setLocalAddress(null);
    }
  };

  const handleChangeAddress = () => {
    setLocalAddress(null);
    setNumber('');
    setComplement('');
    setShippingMethod('');
    setLocalShippingPrice(null);
  };

  const isDeliveryFormValid = useCallback(() => {
    return (
      localAddress !== null &&
      number.trim().length > 0 &&
      fullName.trim().length > 0 &&
      shippingMethod !== ''
    );
  }, [localAddress, number, fullName, shippingMethod]);

  const canFinishPurchase = useMemo(
    () => {
      const isProfileValid =
        profileName.trim().length > 0 &&
        profileEmail.trim().length > 0 &&
        profileCpf.trim().length > 0 &&
        validateCPF(profileCpf) &&
        profilePhone.trim().length > 0;

      const isDeliveryValid =
        localAddress !== null &&
        number.trim().length > 0 &&
        shippingMethod !== '';

      const isPaymentValid =
        (paymentMethod === 'credit-card' || paymentMethod === 'americanas-card') ? (
          cardNumber.replace(/\s/g, '').length === 16 &&
          cardName.trim().length > 0 &&
          cardExpiryMonth !== '' &&
          cardExpiryYear !== '' &&
          cardCvv.length >= 3 &&
          cardCpf.trim().length > 0 &&
          validateCPF(cardCpf)
        ) : (
          paymentMethod === 'pix' || paymentMethod === 'google-pay'
        );

      return isProfileValid && isDeliveryValid && isPaymentValid;
    },
    [profileName, profileEmail, profileCpf, profilePhone, localAddress, number, shippingMethod, paymentMethod, cardNumber, cardName, cardExpiryMonth, cardExpiryYear, cardCvv, cardCpf],
  );

  const [profileNameError, setProfileNameError] = useState('');
  const [profileEmailError, setProfileEmailError] = useState('');
  const [profileCpfError, setProfileCpfError] = useState('');
  const [profilePhoneError, setProfilePhoneError] = useState('');

  const handleGoToDelivery = () => {
    let hasError = false;

    if (!profileName.trim()) {
      setProfileNameError('campo obrigatório.');
      hasError = true;
    } else {
      setProfileNameError('');
    }

    if (!profileEmail.trim()) {
      setProfileEmailError('campo obrigatório.');
      hasError = true;
    } else {
      setProfileEmailError('');
    }

    if (!profileCpf.trim()) {
      setProfileCpfError('campo obrigatório.');
      hasError = true;
    } else if (!validateCPF(profileCpf)) {
      setProfileCpfError('CPF inválido');
      hasError = true;
    } else {
      setProfileCpfError('');
    }

    if (!profilePhone.trim()) {
      setProfilePhoneError('campo obrigatório.');
      hasError = true;
    } else {
      setProfilePhoneError('');
    }

    if (hasError) return;

    setProfileDataSaved(true);
    setCurrentStep('delivery');
  };

  const handleGoToPayment = () => {
    setCurrentStep('payment');
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 150);
  };

  const handleAddGiftCard = () => {
    if (giftCardCode.trim()) {
      setGiftCards(prev => [...prev, giftCardCode.trim()]);
      setGiftCardCode('');
    }
  };

  const handleRemoveGiftCard = (index: number) => {
    setGiftCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishPurchase = async () => {
    if (!validateCPF(cardCpf)) {
      setCardCpfError('CPF inválido');
      return;
    }
    setCardCpfError('');
    setIsProcessing(true);

    try {
      await createOrder({
        dadosPessoais: {
          nome: profileName,
          sobrenome: profileSurname,
          cpf: profileCpf,
          telefone: profilePhone,
          email: profileEmail,
        },
        entrega: {
          cep: localAddress?.cep ?? '',
          rua: localAddress?.street ?? '',
          bairro: localAddress?.neighborhood ?? '',
          cidade: localAddress?.city ?? '',
          estado: localAddress?.state ?? '',
          numero: number,
          complemento: complement || '',
          destinatario: recipientName,
          metodoEntrega: shippingMethod,
          valorFrete: displayShippingPrice,
        },
        pagamento: {
          metodo: paymentMethod,
          nomeCartao: cardName,
          numeroCartao: cardNumber.replace(/\s/g, ''),
          validadeMes: cardExpiryMonth,
          validadeAno: cardExpiryYear,
          cvv: cardCvv,
          cpfTitular: cardCpf,
          parcelas: String(installments),
        },
        resumo: {
          subtotal: safeSubtotal,
          frete: displayShippingPrice,
          total,
        },
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      setIsProcessing(false);
      setCardCpfError('Erro ao salvar pedido. Tente novamente.');
      return;
    }

    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentError(true);
    }, 10000);
  };

  const handlePaymentErrorClose = () => {
    setShowPaymentError(false);
    setCurrentStep('payment');
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const INTEREST_RATE = 0.0184;

  function generateInstallments(totalValue: number) {
    const options = [];

    options.push({
      value: '1',
      label: `Pagamento à vista - ${formatCurrency(totalValue)}`
    });

    for (let i = 2; i <= 12; i++) {
      const finalAmount = totalValue * Math.pow(1 + INTEREST_RATE, i - 1);
      const installmentValue = finalAmount / i;

      options.push({
        value: String(i),
        label: `${i}x de ${formatCurrency(installmentValue)} com juros de 1.84% a.m.`
      });
    }

    return options;
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleCardCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCpf(formatCPF(e.target.value));
    if (cardCpfError) setCardCpfError('');
  };

  const handleCardCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(formatCVV(e.target.value));
  };

  // Verifica se uma etapa está concluída
  const isProfileComplete = currentStep !== 'profile';
  const isDeliveryComplete = currentStep === 'payment';

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#212121]">
      {/* Header */}
      <header className="sticky top-0 z-50 h-[64px] bg-[#f80046] text-white">
        <div className="mx-auto flex h-full max-w-[1216px] items-center justify-between px-4 lg:px-6">
          <Link
            to="/"
            aria-label="Americanas home"
            className="
              relative
              inline-block
              text-[28px]
              font-normal
              leading-none
              tracking-[-0.06em]
              text-[#e60014]
              border-t-2
              border-b-2
              border-current
              py-1
            "
          >
            americanas
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <Lock size={18} strokeWidth={2.4} />
            <span className="leading-tight">
              ambiente
              <br />
              100% seguro
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1216px] px-4 py-6 lg:px-6 lg:py-10">
        {/* Top */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
          <h1 className="text-2xl font-bold text-black lg:text-[30px]">
            finalizar compra
          </h1>

          <button className="flex items-center gap-2 text-[13px] font-medium text-[#f80046]">
            <ArrowLeft size={14} />
            voltar para o carrinho
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Left — Checkout */}
          <div className="w-full lg:flex-1">
            {/* ========== ETAPA 1: DADOS PESSOAIS ========== */}
            <div className="overflow-hidden rounded border border-[#d9d9d9] bg-white">
              <div className="flex items-center justify-between border-b border-[#d9d9d9] px-3 py-3 lg:px-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f80046] text-xs font-bold text-white">
                    1
                  </span>

                  <span className="text-base font-bold text-[#f80046] lg:text-lg">
                    dados pessoais
                  </span>
                </div>

                {currentStep !== 'profile' && (
                  <button
                    className="flex items-center gap-1 text-sm font-semibold text-[#f80046] transition hover:opacity-80"
                    onClick={() => setCurrentStep('profile')}
                    type="button"
                  >
                    <Pencil size={14} />
                    editar
                  </button>
                )}
              </div>

              {currentStep === 'profile' ? (
                <div className="p-3 lg:p-4">
                  {/* Email */}
                  <div className="mb-5">
                    <label className="mb-1 block text-xs text-[#666]">e-mail</label>
                    <input
                      value={profileEmail}
                      onChange={(e) => {
                        setProfileEmail(e.target.value);
                        if (profileEmailError) setProfileEmailError('');
                      }}
                      className={`h-12 w-full rounded border px-3 text-base outline-none lg:h-11 lg:text-sm ${
                        profileEmailError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                      }`}
                    />
                    {profileEmailError && (
                      <p className="mt-1 text-xs text-[#f80046]">{profileEmailError}</p>
                    )}
                  </div>

                  {/* Nome / sobrenome */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-[#666]">nome</label>
                      <input
                        className={`h-12 w-full rounded border px-3 text-base outline-none lg:h-11 lg:text-sm ${
                          profileNameError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                        }`}
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value);
                          if (profileNameError) setProfileNameError('');
                        }}
                      />
                      {profileNameError && (
                        <p className="mt-1 text-xs text-[#f80046]">{profileNameError}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-[#666]">sobrenome</label>
                      <input
                        className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none lg:h-11 lg:text-sm"
                        value={profileSurname}
                        onChange={(e) => setProfileSurname(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* CPF / Telefone */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-[#666]">cpf</label>
                      <input
                        placeholder="000.000.000-00"
                        className={`h-12 w-full rounded border px-3 text-base outline-none lg:h-11 lg:text-sm ${
                          profileCpfError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                        }`}
                        value={profileCpf}
                        onChange={(e) => {
                          setProfileCpf(formatCPF(e.target.value));
                          if (profileCpfError) setProfileCpfError('');
                        }}
                        inputMode="numeric"
                      />
                      {profileCpfError && (
                        <p className="mt-1 text-xs text-[#f80046]">{profileCpfError}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-[#666]">telefone</label>
                      <input
                        placeholder="11 99999-9999"
                        className={`h-12 w-full rounded border px-3 text-base outline-none lg:h-11 lg:text-sm ${
                          profilePhoneError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                        }`}
                        value={profilePhone}
                        onChange={(e) => {
                          setProfilePhone(e.target.value);
                          if (profilePhoneError) setProfilePhoneError('');
                        }}
                        inputMode="tel"
                      />
                      {profilePhoneError && (
                        <p className="mt-1 text-xs text-[#f80046]">{profilePhoneError}</p>
                      )}
                    </div>
                  </div>

                  <button className="mb-8 text-sm text-[#0066cc] underline">
                    incluir dados de pessoa jurídica
                  </button>

                  {/* Compartilhamento */}
                  <div className="mb-6">
                    <h3 className="font-medium">Compartilhamento de dados</h3>
                    <p className="mb-3 text-sm text-[#666]">Deseja receber ofertas personalizadas?</p>
                    <label className="flex gap-2 text-sm">
                      <input type="checkbox" />
                      Sim, aceito compartilhar meus dados com parceiros da Americanas para receber promoções e novidades
                    </label>
                  </div>

                  {/* Recebimento */}
                  <div className="mb-6">
                    <h3 className="font-medium">Recebimento de mensagens</h3>
                    <p className="mb-3 text-sm text-[#666]">Como você prefere receber novidades?</p>
                    <div className="space-y-2">
                      <label className="flex gap-2 text-sm">
                        <input type="checkbox" /> Por SMS
                      </label>
                      <label className="flex gap-2 text-sm">
                        <input type="checkbox" /> Por WhatsApp
                      </label>
                      <label className="flex gap-2 text-sm">
                        <input type="checkbox" /> Por e-mail
                      </label>
                    </div>
                  </div>

                  <p className="mb-5 text-xs text-[#666]">
                    Ao selecionar as opções, você concorda com o nosso Aviso de Privacidade
                  </p>

                  <button
                    className="h-12 w-full rounded bg-[#f80046] text-base font-bold text-white hover:bg-[#e1003e] lg:text-lg"
                    onClick={handleGoToDelivery}
                  >
                    ir para a entrega
                  </button>
                </div>
              ) : (
                /* Resumo dos dados pessoais (etapa fechada) */
                <div className="px-3 py-3 lg:px-4">
                  <div className="space-y-1 text-sm text-[#666]">
                    <p><span className="font-medium text-[#212121]">E-mail:</span> {profileEmail}</p>
                    {profileName && <p><span className="font-medium text-[#212121]">Nome:</span> {profileName} {profileSurname}</p>}
                    {profileCpf && <p><span className="font-medium text-[#212121]">CPF:</span> {profileCpf}</p>}
                    {profilePhone && <p><span className="font-medium text-[#212121]">Telefone:</span> {profilePhone}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* ========== ETAPA 2: ENTREGA ========== */}
            <div className="mt-4 overflow-hidden rounded-lg border border-[#e7e7e7] bg-white">
              <div className="flex items-center justify-between border-b border-[#e7e7e7] px-3 py-3 lg:px-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f80046] text-xs font-bold text-white">
                    2
                  </span>

                  <span className="text-base font-bold text-[#f80046] lg:text-lg">
                    entrega
                  </span>
                </div>

                {currentStep === 'payment' && (
                  <button
                    className="flex items-center gap-1 text-sm font-semibold text-[#f80046] transition hover:opacity-80"
                    onClick={() => setCurrentStep('delivery')}
                    type="button"
                  >
                    <Pencil size={14} />
                    editar
                  </button>
                )}
              </div>

              {currentStep === 'delivery' ? (
                /* Entrega aberta */
                <div className="p-3 lg:p-4">
                  {/* CEP Input */}
                  <div className="mb-5">
                    <h3 className="mb-2 text-sm font-medium text-[#212121]">CEP</h3>
                    <form onSubmit={handleCepSubmit}>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                          <input
                            className={`h-12 w-full rounded-lg border bg-white px-3 text-base font-semibold outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 lg:text-sm ${
                              cepError ? 'border-[#f80046]' : 'border-[#e7e7e7]'
                            }`}
                            placeholder="Digite seu CEP"
                            aria-label="Digite seu CEP"
                            value={formatCEP(cep)}
                            onChange={handleCepChange}
                            inputMode="numeric"
                          />
                        </div>
                        <button
                          className="h-12 rounded-lg border-2 border-[#f80046] px-5 text-sm font-semibold text-[#f80046] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-60"
                          type="submit"
                          disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
                        >
                          {loadingCep ? 'buscando...' : 'buscar'}
                        </button>
                      </div>
                      {cepError && <p className="mt-2 text-xs font-semibold text-[#f80046]">{cepError}</p>}
                    </form>
                  </div>

                  {/* Card de endereço encontrado */}
                  {localAddress && (
                    <div
                      ref={addressCardRef}
                      className="mb-5 rounded-lg border border-[#e7e7e7] bg-[#f9f9f9] p-3 lg:p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Home className="mt-0.5 shrink-0 text-[#f80046]" size={20} />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-semibold text-[#212121]">
                            {localAddress.street}
                          </p>
                          <p className="mt-1 text-sm text-[#666]">
                            {localAddress.neighborhood} - {localAddress.city} - {localAddress.state}
                          </p>
                          <button
                            className="mt-2 text-sm font-medium text-[#0066cc] transition hover:underline"
                            type="button"
                            onClick={handleChangeAddress}
                          >
                            alterar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campos de número, complemento, destinatário */}
                  {localAddress && (
                    <div className="mb-5 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Número */}
                        <div className="sm:col-span-1">
                          <label className="mb-1 block text-xs font-medium text-[#666]">
                            número <span className="text-[#f80046]">*</span>
                          </label>
                          <input
                            className="h-12 w-full rounded-lg border border-[#e7e7e7] bg-white px-3 text-base outline-none transition focus:border-[#f80046] lg:text-sm"
                            placeholder="Número"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                          />
                        </div>

                        {/* Complemento */}
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-[#666]">
                            complemento <span className="text-[#999]">(opcional)</span>
                          </label>
                          <input
                            className="h-12 w-full rounded-lg border border-[#e7e7e7] bg-white px-3 text-base outline-none transition focus:border-[#f80046] lg:text-sm"
                            placeholder="Complemento"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Nome do destinatário */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-[#666]">
                          nome do destinatário <span className="text-[#f80046]">*</span>
                        </label>
                        <input
                          className="h-12 w-full rounded-lg border border-[#e7e7e7] bg-white px-3 text-base outline-none transition focus:border-[#f80046] lg:text-sm"
                          placeholder="Nome completo"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Forma de entrega */}
                  {localAddress && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-medium text-[#212121]">forma de entrega</h3>
                      <div className="space-y-2">
                        <label
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                            shippingMethod === 'same-day'
                              ? 'border-[#f80046] bg-[#fff1f3]'
                              : 'border-[#e7e7e7] bg-white hover:border-[#f80046]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping-method"
                              value="same-day"
                              checked={shippingMethod === 'same-day'}
                              onChange={() => setShippingMethod('same-day')}
                              className="h-4 w-4 accent-[#f80046]"
                            />
                            <span className="text-sm font-medium text-[#212121]">No mesmo dia</span>
                          </div>
                          <span className="text-sm font-semibold text-[#212121]">
                            R$ {localShippingPrice?.toFixed(2).replace('.', ',')}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                  {/* Botão ir para o pagamento */}
                  <button
                    className="h-12 w-full rounded-lg bg-[#f80046] text-base font-bold text-white transition hover:bg-[#e1003e] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={handleGoToPayment}
                    disabled={!isDeliveryFormValid()}
                  >
                    ir para o pagamento
                  </button>
                </div>
              ) : (
                /* Entrega fechada - resumo */
                <div className="px-3 py-3 lg:px-4">
                  {!isProfileComplete ? (
                    <div className="text-sm text-[#999]">
                      Aguardando o preenchimento dos dados
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm text-[#666]">
                      {localAddress && (
                        <p className="font-medium text-[#212121]">
                          {localAddress.street}, {number} {complement && `- ${complement}`}
                        </p>
                      )}
                      {localAddress && (
                        <p>{localAddress.neighborhood} - {localAddress.city} - {localAddress.state}</p>
                      )}
                      {fullName && (
                        <p><span className="font-medium text-[#212121]">Destinatário:</span> {fullName}</p>
                      )}
                      {shippingMethod && localShippingPrice && (
                        <p><span className="font-medium text-[#212121]">Entrega:</span> No mesmo dia - R$ {localShippingPrice.toFixed(2).replace('.', ',')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========== ETAPA 3: PAGAMENTO ========== */}
            <div
              ref={paymentSectionRef}
              className="mt-3 overflow-hidden rounded border border-[#d9d9d9] bg-white"
            >
              <div className="flex items-center gap-3 border-b border-[#d9d9d9] px-3 py-3 lg:px-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f80046] text-xs font-bold text-white">
                  3
                </span>

                <span className="text-base font-bold text-[#f80046] lg:text-lg">
                  pagamento
                </span>
              </div>

              {currentStep === 'payment' ? (
                /* Pagamento aberto */
                <div className="p-3 lg:p-4">
                  {/* Vale-presente */}
                  <div className="mb-5 rounded-lg border border-[#ededed] bg-[#fafafa] p-3 lg:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift size={18} className="text-[#f80046]" />
                        <span className="text-sm font-semibold text-[#212121]">vale-presente</span>
                      </div>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f80046] text-[#f80046] transition hover:bg-[#fff1f3]"
                        type="button"
                        aria-label="Adicionar vale-presente"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Formas de pagamento */}
                  <h3 className="mb-3 font-medium text-[#212121]">formas de pagamento</h3>

                  <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
                    {/* Cartão de crédito */}
                    <button
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition lg:px-3 ${
                        paymentMethod === 'credit-card'
                          ? 'border-[#f80046] bg-[#fff1f3]'
                          : 'border-[#ededed] bg-white hover:border-[#f80046]'
                      }`}
                      type="button"
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <CreditCard size={22} className={paymentMethod === 'credit-card' ? 'text-[#f80046]' : 'text-[#666]'} />
                      <span className={`text-[11px] font-semibold lg:text-xs ${paymentMethod === 'credit-card' ? 'text-[#f80046]' : 'text-[#212121]'}`}>
                        cartão de crédito
                      </span>
                    </button>

                    {/* Pix */}
                    <button
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition lg:px-3 ${
                        paymentMethod === 'pix'
                          ? 'border-[#f80046] bg-[#fff1f3]'
                          : 'border-[#ededed] bg-white hover:border-[#f80046]'
                      }`}
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                    >
                      <QrCode size={22} className={paymentMethod === 'pix' ? 'text-[#f80046]' : 'text-[#666]'} />
                      <span className={`text-[11px] font-semibold lg:text-xs ${paymentMethod === 'pix' ? 'text-[#f80046]' : 'text-[#212121]'}`}>
                        pix
                      </span>
                    </button>

                    {/* Cartão Cliente Americanas */}
                    <button
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition lg:px-3 ${
                        paymentMethod === 'americanas-card'
                          ? 'border-[#f80046] bg-[#fff1f3]'
                          : 'border-[#ededed] bg-white hover:border-[#f80046]'
                      }`}
                      type="button"
                      onClick={() => setPaymentMethod('americanas-card')}
                    >
                      <Wallet size={22} className={paymentMethod === 'americanas-card' ? 'text-[#f80046]' : 'text-[#666]'} />
                      <span className={`text-[11px] font-semibold lg:text-xs ${paymentMethod === 'americanas-card' ? 'text-[#f80046]' : 'text-[#212121]'}`}>
                        cartão cliente americanas
                      </span>
                    </button>

                    {/* Google Pay */}
                    <button
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-center transition lg:px-3 ${
                        paymentMethod === 'google-pay'
                          ? 'border-[#f80046] bg-[#fff1f3]'
                          : 'border-[#ededed] bg-white hover:border-[#f80046]'
                      }`}
                      type="button"
                      onClick={() => setPaymentMethod('google-pay')}
                    >
                      <SmartphoneIcon size={22} className={paymentMethod === 'google-pay' ? 'text-[#f80046]' : 'text-[#666]'} />
                      <span className={`text-[11px] font-semibold lg:text-xs ${paymentMethod === 'google-pay' ? 'text-[#f80046]' : 'text-[#212121]'}`}>
                        google pay
                      </span>
                    </button>
                  </div>

                  {/* Conteúdo por forma de pagamento */}
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs text-[#666]">número do cartão</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">número de parcelas</label>
                        <div className="relative">
                          <select
                            className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                          >
                            {generateInstallments(total).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">nome impresso no cartão</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="Nome como está no cartão"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-[#666]">validade mês</label>
                          <div className="relative">
                            <select
                              className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                              value={cardExpiryMonth}
                              onChange={(e) => setCardExpiryMonth(e.target.value)}
                            >
                              <option value="" disabled>mês</option>
                              {months.map((month) => (
                                <option key={month} value={month}>
                                  {month}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-[#666]">validade ano</label>
                          <div className="relative">
                            <select
                              className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                              value={cardExpiryYear}
                              onChange={(e) => setCardExpiryYear(e.target.value)}
                            >
                              <option value="" disabled>ano</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year.slice(-2)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">código de segurança</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={handleCardCVVChange}
                          inputMode="numeric"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">cpf do titular</label>
                        <input
                          className={`h-12 w-full rounded border px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm ${
                            cardCpfError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                          }`}
                          placeholder="000.000.000-00"
                          value={cardCpf}
                          onChange={handleCardCPFChange}
                          inputMode="numeric"
                        />
                        {cardCpfError && (
                          <p className="mt-1 text-xs text-[#f80046]">{cardCpfError}</p>
                        )}
                      </div>

                      <label className="flex items-center gap-2 text-sm text-[#212121]">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#bdbdbd] text-[#f80046] accent-[#f80046]"
                          checked={sameBillingAddress}
                          onChange={(e) => setSameBillingAddress(e.target.checked)}
                        />
                        o endereço da fatura do cartão é o mesmo da entrega
                      </label>
                    </div>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="rounded-lg border border-[#ededed] bg-[#fafafa] p-5 text-center">
                      <Smartphone className="mx-auto mb-3 text-[#f80046]" size={36} />
                      <h4 className="mb-2 text-base font-semibold text-[#212121]">
                        pagamento instantâneo via PIX.
                      </h4>
                      <p className="text-sm text-[#666]">
                        após finalizar a compra será gerado um QR Code.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'americanas-card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs text-[#666]">número do cartão</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          inputMode="numeric"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">número de parcelas</label>
                        <div className="relative">
                          <select
                            className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                          >
                            {generateInstallments(total).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">nome impresso no cartão</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="Nome como está no cartão"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-[#666]">validade mês</label>
                          <div className="relative">
                            <select
                              className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                              value={cardExpiryMonth}
                              onChange={(e) => setCardExpiryMonth(e.target.value)}
                            >
                              <option value="" disabled>mês</option>
                              {months.map((month) => (
                                <option key={month} value={month}>
                                  {month}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-[#666]">validade ano</label>
                          <div className="relative">
                            <select
                              className="h-12 w-full appearance-none rounded border border-[#bdbdbd] bg-white px-3 pr-10 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                              value={cardExpiryYear}
                              onChange={(e) => setCardExpiryYear(e.target.value)}
                            >
                              <option value="" disabled>ano</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year.slice(-2)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">código de segurança</label>
                        <input
                          className="h-12 w-full rounded border border-[#bdbdbd] px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={handleCardCVVChange}
                          inputMode="numeric"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-[#666]">cpf do titular</label>
                        <input
                          className={`h-12 w-full rounded border px-3 text-base outline-none transition focus:border-[#f80046] lg:h-11 lg:text-sm ${
                            cardCpfError ? 'border-[#f80046]' : 'border-[#bdbdbd]'
                          }`}
                          placeholder="000.000.000-00"
                          value={cardCpf}
                          onChange={handleCardCPFChange}
                          inputMode="numeric"
                        />
                        {cardCpfError && (
                          <p className="mt-1 text-xs text-[#f80046]">{cardCpfError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'google-pay' && (
                    <div className="rounded-lg border border-[#ededed] bg-[#fafafa] p-4 sm:p-5">
                      <button
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-white transition hover:bg-[#1a1a1a]"
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                          <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" fill="#fff"/>
                        </svg>
                        <span className="text-sm font-semibold">pagar com Google Pay</span>
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                /* Pagamento fechado */
                <div className="px-3 py-3 lg:px-4">
                  <div className="text-sm text-[#999]">
                    Aguardando o preenchimento dos dados
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo */}
          <aside className="w-full lg:w-[320px]">
            <div className="rounded border border-[#d9d9d9] bg-white p-3 lg:p-4">
              <h2 className="mb-4 text-lg font-bold lg:text-xl">
                resumo do pedido
              </h2>

              {items.length > 0 ? (
                <>
                  <div className="max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 border-b pb-4 mb-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-14 w-14 shrink-0 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{item.title}</p>
                          <p className="mt-1 text-xs text-[#666]">Qtd: {item.quantity}</p>
                          <p className="mt-1 font-bold">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between text-[#666]">
                      <span className="font-semibold">subtotal</span>
                      <strong className="font-normal text-[#212121]">R$ {safeSubtotal.toFixed(2).replace('.', ',')}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[#666]">
                      <span className="font-semibold">entrega</span>
                      <strong className="font-normal text-[#212121]">
                        {displayShippingPrice > 0 ? `R$ ${displayShippingPrice.toFixed(2).replace('.', ',')}` : 'não calculado'}
                      </strong>
                    </div>

                    <div className="mt-4 border-t border-[#ededed] pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-normal text-black lg:text-2xl">total</span>
                        <strong className="text-xl font-normal tracking-[-0.04em] text-black lg:text-2xl">R$ {total.toFixed(2).replace('.', ',')}</strong>
                      </div>
                    </div>

                    <button
                      className="mt-5 flex h-12 w-full items-center justify-center rounded bg-[#f80046] text-sm font-bold text-white transition hover:bg-[#e1003e] disabled:cursor-not-allowed disabled:opacity-60 lg:h-11"
                      type="button"
                      onClick={handleFinishPurchase}
                      disabled={!canFinishPurchase || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        'finalizar compra'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-sm text-[#666]">Carrinho vazio</p>
              )}

              <p className="mt-5 text-center text-xs text-[#666]">
                Ao continuar com o acesso, você concorda com o nosso Aviso de Privacidade.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <CheckoutFooter />

      {/* Modal de carregamento */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-[340px] flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
            <Loader2 className="animate-spin text-[#f80046]" size={40} />
            <p className="text-center text-base font-semibold text-[#212121]">aguarde...</p>
            <p className="text-center text-sm text-[#666]">estamos finalizando sua compra.</p>
          </div>
        </div>
      )}

      {/* Modal de erro de pagamento */}
      {showPaymentError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1f3]">
                <X size={28} className="text-[#f80046]" strokeWidth={2.5} />
              </div>
              <h2 className="text-center text-lg font-bold text-[#212121]">
                por favor, revise seus dados de pagamento
              </h2>
            </div>

            <p className="text-center text-sm leading-relaxed text-[#666]">
              sua compra não foi finalizada devido a algum problema na autorização do pagamento.
              <br /><br />
              seu pagamento foi recusado devido a alguma informação incorreta ou saldo insuficiente.
            </p>

            <button
              className="mt-2 flex h-11 w-full items-center justify-center rounded bg-[#f80046] text-sm font-bold text-white transition hover:bg-[#e1003e]"
              type="button"
              onClick={handlePaymentErrorClose}
            >
              revisar dados ou pagar de outra forma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
