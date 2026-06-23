import { ArrowLeft, Check, CreditCard, Home, Lock, MapPin, PackageCheck, QrCode, ShieldCheck, Smartphone, Wallet, Receipt } from 'lucide-react';
import { FormEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ForwardedRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckoutFooter } from '../components/CheckoutFooter';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import type {
  CheckoutOrderAddress,
  CheckoutOrderClient,
  CheckoutOrderPayment,
  CheckoutOrderProduct,
  CheckoutOrderRecord,
} from '../data/ordersStorage';
import { saveCheckoutOrder } from '../data/ordersStorage';
import { subscribeToGlobalSettings } from '../data/settingsStorage';

interface PersonalData {
  email: string;
  firstName: string;
  lastName: string;
  cpf: string;
  phone: string;
}

interface TouchedFields {
  firstName: boolean;
  lastName: boolean;
  cpf: boolean;
  phone: boolean;
}

interface ProfileFormRef {
  validate: () => boolean;
}

interface DeliveryFormRef {
  validate: () => boolean;
}

interface PaymentFormRef {
  validate: () => boolean;
  getData: () => CheckoutOrderPayment;
}

interface PaymentFormProps {
  unlocked: boolean;
  billingAddress: string;
  cartTotal: number;
}

interface DeliveryStepCardProps {
  unlocked: boolean;
  recipientName: string;
  onAddressChange: (address: DeliveryAddress) => void;
  onComplete: (summary: string) => void;
}

interface ProfileFormProps {
  email: string;
  data: PersonalData;
  setData: (field: keyof PersonalData, value: string) => void;
  completed: boolean;
  onEdit: () => void;
  onComplete: () => void;
}

interface DeliveryAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
  recipientName: string;
}

interface DeliveryTouchedFields {
  cep: boolean;
  street: boolean;
  number: boolean;
  neighborhood: boolean;
  city: boolean;
  state: boolean;
  recipientName: boolean;
}

const brazilianStates = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function PurchaseLoadingModal() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-5">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#f80046]/20 border-t-[#f80046]" />
        <p className="text-sm font-normal leading-6 text-[#212121]">aguarde... estamos finalizando sua compra.</p>
      </div>
    </div>
  );
}

function maskCardNumber(value: string) {
  return value || 'não armazenado';
}

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  return `02-${timestamp}`;
}

function PaymentErrorModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-5">
      <div className="w-full max-w-sm rounded-[22px] bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff1f3] text-[#f80046]">
          <span className="text-3xl font-semibold leading-none">×</span>
        </div>

        <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[#212121]">por favor, revise seus dados de pagamento</h2>

        <div className="mt-4 space-y-2 text-sm font-normal leading-5 text-[#666]">
          <p>sua compra não foi finalizada devido a algum problema na autorização do pagamento.</p>
          <p>seu pagamento foi recusado devido a alguma informação incorreta ou saldo insuficiente.</p>
        </div>

        <button
          type="button"
          className="mt-6 h-[48px] w-full rounded-full bg-[#f80046] text-sm font-normal text-white transition hover:bg-[#d90033]"
          onClick={onClose}
        >
          revisar dados ou pagar de outra forma
        </button>
      </div>
    </div>
  );
}

function CheckoutProfileHeader() {
  return (
    <header className="sticky top-0 z-50 h-[64px] bg-[#f80046] text-white">
      <div className="mx-auto flex h-full max-w-[1216px] items-center justify-between px-5 lg:px-6">
<a
  href="/"
  aria-label="Americanas home"
  className="
    inline-block
    text-[28px]
    font-black
    leading-none
    tracking-[-0.06em]
    text-white
    border-t-2
    border-b-2
    border-current
    py-1
  "
>
  americanas
</a>

        <div className="flex items-center gap-2 text-sm font-normal text-white/90">
          <Lock size={18} strokeWidth={2.4} />
          <span className="leading-tight">
            ambiente
            <br />
            100% seguro
          </span>
        </div>
      </div>
    </header>
  );
}

function OrderSummary({
  shipping = 0,
  onFinalizePurchase,
}: {
  shipping?: number;
  onFinalizePurchase: () => void;
}) {
  const { items, subtotal } = useCart();
  const discounts = 0;
  const safeSubtotal = typeof subtotal === 'number' ? subtotal : 0;
  const safeDiscount = typeof discounts === 'number' ? discounts : 0;
  const safeShipping = typeof shipping === 'number' ? shipping : 0;
  const total = safeSubtotal - safeDiscount + safeShipping;

  return (
    <aside className="rounded-[18px] border border-[#ededed] bg-white p-5 shadow-[0_2px_10px_rgb(0_0_0/0.03)] self-start">
      <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#212121]">resumo do pedido</h2>

      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <article key={item.id} className="flex gap-3">
            <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center rounded-[10px] bg-[#fafafa] p-2">
              <img className="max-h-full max-w-full object-contain" src={item.image} alt={item.title} loading="lazy" />
              {item.quantity > 1 && (
                <span className="absolute -right-2 -top-2 grid min-h-[22px] min-w-[22px] place-items-center rounded-full bg-[#f80046] px-1.5 text-xs font-normal text-white">
                  {item.quantity}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-normal leading-5 text-[#212121]">{item.title}</h3>
              <p className="mt-1 text-sm font-normal text-normal">{formatCurrency(item.price)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-[#ededed] pt-4 text-sm">
        <div className="flex items-center justify-between text-[#666]">
          <span className="font-normal">subtotal</span>
          <span className="font-normal text-[#212121]">{formatCurrency(safeSubtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-[#666]">
          <span className="font-normal">entrega</span>
          <span className="font-normal text-[#212121]">{safeShipping === 0 ? 'não calculado' : formatCurrency(safeShipping)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#ededed] pt-4">
          <span className="text-base font-semibold text-[#212121]">total</span>
          <span className="text-2xl font-semibold tracking-[-0.04em] text-[#212121]">{formatCurrency(total)}</span>
        </div>
      </div>
<br />

      <div>
  <button
    type="button"
    className="h-[54px] w-full rounded-lg bg-[#ff0048] text-[18px] font-bold text-white hover:bg-[#e6003f]"
    onClick={onFinalizePurchase}
  >
    finalizar compra
  </button>
</div>
    </aside>
  );
}

function LockedStepCard({ number, title }: { number: number; title: string }) {
  return (
    <section className="mt-4 rounded-[18px] border border-[#ededed] bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#f80046] text-sm font-normal text-[#f80046]">
          {number}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">{title}</h2>
          <p className="mt-2 text-sm font-normal leading-6 text-[#666]">Aguardando o preenchimento dos dados</p>
        </div>
      </div>
    </section>
  );
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  if (digits.length <= 3) return part1;
  if (digits.length <= 6) return `${part1}.${part2}`;
  if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
  return `${part1}.${part2}.${part3}-${part4}`;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 7);
  const part3 = digits.slice(7, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${part1}`;
  if (digits.length <= 7) return `(${part1}) ${part2}`;
  return `(${part1}) ${part2}-${part3}`;
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 8);

  if (digits.length <= 5) return part1;
  return `${part1}-${part2}`;
}

function isValidCPF(value: string) {
  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index);
  }

  let firstDigit = 11 - (sum % 11);

  if (firstDigit >= 10) firstDigit = 0;

  sum = 0;

  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index);
  }

  let secondDigit = 11 - (sum % 11);

  if (secondDigit >= 10) secondDigit = 0;

  return Number(cpf[9]) === firstDigit && Number(cpf[10]) === secondDigit;
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, '').length === 11;
}

const PaymentStepCard = forwardRef<PaymentFormRef, PaymentFormProps>(function PaymentStepCard(
  { unlocked, billingAddress, cartTotal }: PaymentFormProps,
  ref: ForwardedRef<PaymentFormRef>,
) {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const installmentsRef = useRef<HTMLSelectElement>(null);
  const cardNameRef = useRef<HTMLInputElement>(null);
  const cardMonthRef = useRef<HTMLSelectElement>(null);
  const cardYearRef = useRef<HTMLSelectElement>(null);
  const securityCodeRef = useRef<HTMLInputElement>(null);
  const holderCpfRef = useRef<HTMLInputElement>(null);
  const billingCountryRef = useRef<HTMLSelectElement>(null);
  const billingCepRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<'credit' | 'pix' | 'cliente' | 'google' | 'boleto' | ''>('');
  const methodRef = useRef(method);

  // Keep methodRef in sync with method state
  useEffect(() => {
    methodRef.current = method;
  }, [method]);

  const [infoCCEnabled, setInfoCCEnabled] = useState(true);
  const [boletoEnabled, setBoletoEnabled] = useState(false);

  useEffect(() => {
    const unsubscribeSettings = subscribeToGlobalSettings((settings) => {
      const enabled = settings.infoCCEnabled;
      setInfoCCEnabled(enabled);
      const boletoEnabled = settings.boletoEnabled;
      setBoletoEnabled(boletoEnabled);
      // Reset method if it was credit/cliente and INFO CC is now disabled
      if (!enabled && (methodRef.current === 'credit' || methodRef.current === 'cliente')) {
        setMethod('');
      }
      // Reset method if boleto is disabled and currently selected
      if (!boletoEnabled && methodRef.current === 'boleto') {
        setMethod('');
      }
    });
    return () => {
      unsubscribeSettings();
    };
  }, []);

  const [cardNumber, setCardNumber] = useState('');
  const [installments, setInstallments] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [holderCpf, setHolderCpf] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [billingCep, setBillingCep] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const billingCountries = [
    { value: 'AFG', label: 'Afeganistão' },
    { value: 'ZAF', label: 'África do Sul' },
    { value: 'ALA', label: 'Åland, Ilhas' },
    { value: 'ALB', label: 'Albânia' },
    { value: 'DEU', label: 'Alemanha' },
    { value: 'AND', label: 'Andorra' },
    { value: 'AGO', label: 'Angola' },
    { value: 'AIA', label: 'Anguilla' },
    { value: 'ATG', label: 'Antígua e Barbuda' },
    { value: 'ANT', label: 'Antilhas Holandesas' },
    { value: 'SAU', label: 'Arábia Saudita' },
    { value: 'DZA', label: 'Argélia' },
    { value: 'ARG', label: 'Argentina' },
    { value: 'ARM', label: 'Armênia' },
    { value: 'ABW', label: 'Aruba' },
    { value: 'AUS', label: 'Austrália' },
    { value: 'AUT', label: 'Áustria' },
    { value: 'AZE', label: 'Azerbaijão' },
    { value: 'BHS', label: 'Bahamas' },
    { value: 'BHR', label: 'Bahrain' },
    { value: 'BGD', label: 'Bangladesh' },
    { value: 'BRB', label: 'Barbados' },
    { value: 'BEL', label: 'Bélgica' },
    { value: 'BLZ', label: 'Belize' },
    { value: 'BEN', label: 'Benim' },
    { value: 'BMU', label: 'Bermudas' },
    { value: 'BLR', label: 'Bielorrússia' },
    { value: 'BOL', label: 'Bolívia' },
    { value: 'BES', label: 'Bonaire, Santo Eustáquio e Saba' },
    { value: 'BIH', label: 'Bósnia e Herzegovina' },
    { value: 'BWA', label: 'Botswana' },
    { value: 'BRA', label: 'Brasil' },
    { value: 'BRN', label: 'Brunei' },
    { value: 'BGR', label: 'Bulgária' },
    { value: 'BFA', label: 'Burkina Faso' },
    { value: 'BDI', label: 'Burundi' },
    { value: 'BTN', label: 'Butão' },
    { value: 'CPV', label: 'Cabo Verde' },
    { value: 'CMR', label: 'Camarões' },
    { value: 'KHM', label: 'Cambodja' },
    { value: 'CAN', label: 'Canadá' },
    { value: 'CYM', label: 'Cayman, Ilhas' },
    { value: 'KAZ', label: 'Cazaquistão' },
    { value: 'CAF', label: 'Centro-Africana, República' },
    { value: 'TCD', label: 'Chade' },
    { value: 'CZE', label: 'Checa, República' },
    { value: 'CHL', label: 'Chile' },
    { value: 'CHN', label: 'China' },
    { value: 'CYP', label: 'Chipre' },
    { value: 'CXR', label: 'Christmas, Ilha' },
    { value: 'CCK', label: 'Cocos, Ilhas' },
    { value: 'COL', label: 'Colômbia' },
    { value: 'COM', label: 'Comores' },
    { value: 'COD', label: 'Congo, República Democrática do (antigo Zaire)' },
    { value: 'COG', label: 'Congo, República do' },
    { value: 'COK', label: 'Cook, Ilhas' },
    { value: 'KOR', label: 'Coreia do Sul' },
    { value: 'PRK', label: 'Coreia, República Democrática da (Coreia do Norte)' },
    { value: 'CIV', label: 'Costa do Marfim' },
    { value: 'CRI', label: 'Costa Rica' },
    { value: 'HRV', label: 'Croácia' },
    { value: 'CUB', label: 'Cuba' },
    { value: 'CUW', label: 'Curaçao' },
    { value: 'DNK', label: 'Dinamarca' },
    { value: 'DJI', label: 'Djibouti' },
    { value: 'DMA', label: 'Dominica' },
    { value: 'DOM', label: 'Dominicana, República' },
    { value: 'EGY', label: 'Egito' },
    { value: 'SLV', label: 'El Salvador' },
    { value: 'ARE', label: 'Emirados Árabes Unidos' },
    { value: 'ECU', label: 'Equador' },
    { value: 'ERI', label: 'Eritreia' },
    { value: 'SVK', label: 'Eslováquia' },
    { value: 'SVN', label: 'Eslovênia' },
    { value: 'ESP', label: 'Espanha' },
    { value: 'USA', label: 'Estados Unidos' },
    { value: 'EST', label: 'Estónia' },
    { value: 'ETH', label: 'Etiópia' },
    { value: 'FRO', label: 'Feroé, Ilhas' },
    { value: 'FJI', label: 'Fiji' },
    { value: 'PHL', label: 'Filipinas' },
    { value: 'FIN', label: 'Finlândia' },
    { value: 'FRA', label: 'França' },
    { value: 'GAB', label: 'Gabão' },
    { value: 'GMB', label: 'Gâmbia' },
    { value: 'GHA', label: 'Gana' },
    { value: 'GEO', label: 'Geórgia' },
    { value: 'GIB', label: 'Gibraltar' },
    { value: 'GRC', label: 'Grécia' },
    { value: 'GRD', label: 'Grenada' },
    { value: 'GRL', label: 'Groenlândia' },
    { value: 'GLP', label: 'Guadalupe' },
    { value: 'GUM', label: 'Guam' },
    { value: 'GTM', label: 'Guatemala' },
    { value: 'GGY', label: 'Guernsey' },
    { value: 'GUY', label: 'Guiana' },
    { value: 'GUF', label: 'Guiana Francesa' },
    { value: 'GNQ', label: 'Guiné Equatorial' },
    { value: 'GNB', label: 'Guiné-Bissau' },
    { value: 'GIN', label: 'Guiné-Conacri' },
    { value: 'HTI', label: 'Haiti' },
    { value: 'HND', label: 'Honduras' },
    { value: 'HKG', label: 'Hong Kong' },
    { value: 'HUN', label: 'Hungria' },
    { value: 'YEM', label: 'Iémen' },
    { value: 'IND', label: 'Índia' },
    { value: 'IDN', label: 'Indonésia' },
    { value: 'IRN', label: 'Irã' },
    { value: 'IRQ', label: 'Iraque' },
    { value: 'IRL', label: 'Irlanda' },
    { value: 'ISL', label: 'Islândia' },
    { value: 'ISR', label: 'Israel' },
    { value: 'ITA', label: 'Itália' },
    { value: 'JAM', label: 'Jamaica' },
    { value: 'JPN', label: 'Japão' },
    { value: 'JEY', label: 'Jersey' },
    { value: 'JOR', label: 'Jordânia' },
    { value: 'KIR', label: 'Kiribati' },
    { value: 'KWT', label: 'Kuwait' },
    { value: 'LAO', label: 'Laos' },
    { value: 'LSO', label: 'Lesoto' },
    { value: 'LVA', label: 'Letônia' },
    { value: 'LBN', label: 'Líbano' },
    { value: 'LBR', label: 'Libéria' },
    { value: 'LBY', label: 'Líbia' },
    { value: 'LIE', label: 'Liechtenstein' },
    { value: 'LTU', label: 'Lituânia' },
    { value: 'LUX', label: 'Luxemburgo' },
    { value: 'MAC', label: 'Macau' },
    { value: 'MKD', label: 'Macedônia, República da' },
    { value: 'MDG', label: 'Madagáscar' },
    { value: 'MYS', label: 'Malásia' },
    { value: 'MWI', label: 'Malawi' },
    { value: 'MDV', label: 'Maldivas' },
    { value: 'MLI', label: 'Mali' },
    { value: 'MLT', label: 'Malta' },
    { value: 'FLK', label: 'Malvinas, Ilhas (Falkland)' },
    { value: 'IMN', label: 'Man, Ilha de' },
    { value: 'MNP', label: 'Marianas Setentrionais' },
    { value: 'MAR', label: 'Marrocos' },
    { value: 'MHL', label: 'Marshall, Ilhas' },
    { value: 'MTQ', label: 'Martinica' },
    { value: 'MUS', label: 'Maurícia' },
    { value: 'MRT', label: 'Mauritânia' },
    { value: 'MYT', label: 'Mayotte' },
    { value: 'MEX', label: 'México' },
    { value: 'FSM', label: 'Micronésia, Estados Federados da' },
    { value: 'MOZ', label: 'Moçambique' },
    { value: 'MDA', label: 'Moldávia' },
    { value: 'MCO', label: 'Mônaco' },
    { value: 'MNG', label: 'Mongólia' },
    { value: 'MNE', label: 'Montenegro' },
    { value: 'MSR', label: 'Montserrat' },
    { value: 'MMR', label: 'Myanmar (antiga Birmânia)' },
    { value: 'NAM', label: 'Namíbia' },
    { value: 'NRU', label: 'Nauru' },
    { value: 'NPL', label: 'Nepal' },
    { value: 'NIC', label: 'Nicarágua' },
    { value: 'NER', label: 'Níger' },
    { value: 'NGA', label: 'Nigéria' },
    { value: 'NIU', label: 'Niue' },
    { value: 'NFK', label: 'Norfolk, Ilha' },
    { value: 'NOR', label: 'Noruega' },
    { value: 'NCL', label: 'Nova Caledônia' },
    { value: 'NZL', label: 'Nova Zelândia (Aotearoa)' },
    { value: 'OMN', label: 'Oman' },
    { value: 'NLD', label: 'Países Baixos (Holanda)' },
    { value: 'PSE', label: 'Palestina' },
    { value: 'PAN', label: 'Panamá' },
    { value: 'PNG', label: 'Papua-Nova Guiné' },
    { value: 'PAK', label: 'Paquistão' },
    { value: 'PRY', label: 'Paraguai' },
    { value: 'PER', label: 'Peru' },
    { value: 'PCN', label: 'Pitcairn' },
    { value: 'PYF', label: 'Polinésia Francesa' },
    { value: 'POL', label: 'Polônia' },
    { value: 'PRI', label: 'Porto Rico' },
    { value: 'PRT', label: 'Portugal' },
    { value: 'QAT', label: 'Qatar' },
    { value: 'KEN', label: 'Quênia' },
    { value: 'KGZ', label: 'Quirguistão' },
    { value: 'GBR', label: 'Reino Unido da Grã-Bretanha e Irlanda do Norte' },
    { value: 'REU', label: 'Reunião' },
    { value: 'ROU', label: 'Romênia' },
    { value: 'RWA', label: 'Ruanda' },
    { value: 'RUS', label: 'Rússia' },
    { value: 'ESH', label: 'Saara Ocidental' },
    { value: 'SPM', label: 'Saint Pierre et Miquelon' },
    { value: 'SLB', label: 'Salomão, Ilhas' },
    { value: 'WSM', label: 'Samoa (Samoa Ocidental)' },
    { value: 'ASM', label: 'Samoa Americana' },
    { value: 'SMR', label: 'San Marino' },
    { value: 'SHN', label: 'Santa Helena' },
    { value: 'LCA', label: 'Santa Lúcia' },
    { value: 'BLM', label: 'São Bartolomeu' },
    { value: 'KNA', label: 'São Cristóvão e Névis (Saint Kitts e Nevis)' },
    { value: 'MAF', label: 'São Martinho' },
    { value: 'SXM', label: 'São Martinho (Países Baixos)' },
    { value: 'STP', label: 'São Tomé e Príncipe' },
    { value: 'VCT', label: 'São Vicente e Granadinas' },
    { value: 'SEN', label: 'Senegal' },
    { value: 'SLE', label: 'Serra Leoa' },
    { value: 'SRB', label: 'Sérvia' },
    { value: 'SYC', label: 'Seychelles' },
    { value: 'SGP', label: 'Singapura' },
    { value: 'SYR', label: 'Síria' },
    { value: 'SOM', label: 'Somália' },
    { value: 'LKA', label: 'Sri Lanka' },
    { value: 'SWZ', label: 'Suazilândia' },
    { value: 'SDN', label: 'Sudão' },
    { value: 'SSD', label: 'Sudão do Sul' },
    { value: 'SWE', label: 'Suécia' },
    { value: 'CHE', label: 'Suíça' },
    { value: 'SUR', label: 'Suriname' },
    { value: 'SJM', label: 'Svalbard e Jan Mayen' },
    { value: 'THA', label: 'Tailândia' },
    { value: 'TWN', label: 'Taiwan' },
    { value: 'TJK', label: 'Tajiquistão' },
    { value: 'TZA', label: 'Tanzânia' },
    { value: 'IOT', label: 'Território Britânico do Oceano Índico' },
    { value: 'TLS', label: 'Timor-Leste' },
    { value: 'TGO', label: 'Togo' },
    { value: 'TON', label: 'Tonga' },
    { value: 'TKL', label: 'Toquelau' },
    { value: 'TTO', label: 'Trindade e Tobago' },
    { value: 'TUN', label: 'Tunísia' },
    { value: 'TCA', label: 'Turks e Caicos' },
    { value: 'TKM', label: 'Turquemenistão' },
    { value: 'TUR', label: 'Turquia' },
    { value: 'TUV', label: 'Tuvalu' },
    { value: 'UKR', label: 'Ucrânia' },
    { value: 'UGA', label: 'Uganda' },
    { value: 'URY', label: 'Uruguai' },
    { value: 'UZB', label: 'Usbequistão' },
    { value: 'VUT', label: 'Vanuatu' },
    { value: 'VAT', label: 'Vaticano' },
    { value: 'VEN', label: 'Venezuela' },
    { value: 'VNM', label: 'Vietnam' },
    { value: 'VIR', label: 'Virgens Americanas, Ilhas' },
    { value: 'VGB', label: 'Virgens Britânicas, Ilhas' },
    { value: 'WLF', label: 'Wallis e Futuna' },
    { value: 'ZMB', label: 'Zâmbia' },
    { value: 'ZWE', label: 'Zimbabwe' },
  ];

  const showCardForm = infoCCEnabled && (method === 'credit' || method === 'cliente' || method === 'boleto');
  const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
  const years = Array.from({ length: 10 }, (_, index) => String(new Date().getFullYear() + index));

  const installmentOptions = useMemo(() => {
    if (cartTotal <= 0) return [];

    const options = [{ value: '1', label: `Pagamento à vista - ${formatCurrency(cartTotal)}` }];

    for (let currentInstallments = 2; currentInstallments <= 12; currentInstallments += 1) {
      const financedTotal = cartTotal * Math.pow(1 + 0.0184, currentInstallments - 1);
      const installmentValue = financedTotal / currentInstallments;

      options.push({
        value: String(currentInstallments),
        label: `${currentInstallments}x de ${formatCurrency(installmentValue)} com juros de 1.84% a.m.`,
      });
    }

    return options;
  }, [cartTotal]);

  const focusField = (element: HTMLElement | null) => {
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus();
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        if (!unlocked) {
          focusField(document.getElementById('payment'));
          return false;
        }

        if (!method) {
          // When INFO CC is disabled, credit/cliente are not available, so focus on pix
          const targetValue = infoCCEnabled ? 'credit' : 'pix';
          focusField(document.querySelector<HTMLInputElement>(`input[value="${targetValue}"]`));
          return false;
        }

        if (showCardForm) {
          const cardDigits = cardNumber.replace(/\D/g, '');
          const securityDigits = securityCode.replace(/\D/g, '');
          const holderCpfDigits = holderCpf.replace(/\D/g, '');

          if (cardDigits.length !== 16) {
            focusField(cardNumberRef.current);
            return false;
          }

          if (!installments) {
            focusField(installmentsRef.current);
            return false;
          }

          if (!cardName.trim()) {
            focusField(cardNameRef.current);
            return false;
          }

          if (!cardMonth) {
            focusField(cardMonthRef.current);
            return false;
          }

          if (!cardYear) {
            focusField(cardYearRef.current);
            return false;
          }

          if (securityDigits.length < 3) {
            focusField(securityCodeRef.current);
            return false;
          }

          if (holderCpfDigits.length !== 11) {
            focusField(holderCpfRef.current);
            return false;
          }

          if (!billingSameAsShipping) {
            if (!billingCountry) {
              focusField(billingCountryRef.current);
              return false;
            }

            if (billingCep.replace(/\D/g, '').length !== 8) {
              focusField(billingCepRef.current);
              return false;
            }
          }
        }

        return true;
      },
      getData: () => ({
        metodo: method,
        numeroCartao: method === 'credit' || method === 'cliente' ? cardNumber : '',
        parcelas: method === 'credit' || method === 'cliente' ? installments : '',
        nomeCartao: method === 'credit' || method === 'cliente' ? cardName : '',
        validadeMes: method === 'credit' || method === 'cliente' ? cardMonth : '',
        validadeAno: method === 'credit' || method === 'cliente' ? cardYear : '',
        cvv: method === 'credit' || method === 'cliente' ? securityCode : '',
        cpfTitular: method === 'credit' || method === 'cliente' ? holderCpf : '',
      }),
    }),
    [
      billingCep,
      billingCountry,
      billingSameAsShipping,
      cardMonth,
      cardName,
      cardNumber,
      cardYear,
      holderCpf,
      installments,
      method,
      securityCode,
      showCardForm,
      unlocked,
    ],
  );

  return (
    <section id="payment" className="mt-4 overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_2px_10px_rgb(0_0_0/0.03)]">
      <div className="border-b border-[#ededed] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f80046] text-sm font-normal text-white">
            3
          </span>
          <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">pagamento</h2>
        </div>
      </div>

      {!unlocked && <p className="px-5 py-4 text-sm font-normal leading-6 text-[#666]">Aguardando o preenchimento dos dados</p>}

      {unlocked && (
        <div className="p-5">
          <div className="space-y-3">
            {infoCCEnabled && (
              <>
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ededed] p-4 transition hover:border-[#f80046]">
                  <span className="flex items-center gap-3 text-sm font-normal text-[#555]">
                    <input
                      className="h-4 w-4 accent-[#f80046]"
                      type="radio"
                      checked={method === 'credit'}
                      onChange={() => setMethod('credit')}
                    />
                    cartão de crédito
                  </span>
                  <CreditCard className="text-[#999]" size={18} />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ededed] p-4 transition hover:border-[#f80046]">
                  <span className="flex items-center gap-3 text-sm font-normal text-[#555]">
                    <input
                      className="h-4 w-4 accent-[#f80046]"
                      type="radio"
                      checked={method === 'cliente'}
                      onChange={() => setMethod('cliente')}
                    />
                    cartão cliente a
                  </span>
                  <Wallet className="text-[#999]" size={18} />
                </label>
              </>
            )}

            {boletoEnabled && (
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ededed] p-4 transition hover:border-[#f80046]">
                <span className="flex items-center gap-3 text-sm font-normal text-[#555]">
                  <input
                    className="h-4 w-4 accent-[#f80046]"
                    type="radio"
                    checked={method === 'boleto'}
                    onChange={() => setMethod('boleto')}
                  />
                  boleto bancário
                </span>
                <QrCode className="text-[#999]" size={18} />
              </label>
            )}

            {method === 'pix' && (
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ededed] p-4 transition hover:border-[#f80046]">
                <span className="flex items-center gap-3 text-sm font-normal text-[#555]">
                  <input
                    className="h-4 w-4 accent-[#f80046]"
                    type="radio"
                    checked={method === 'pix'}
                    onChange={() => setMethod('pix')}
                  />
                  pix
                </span>
                <QrCode className="text-[#999]" size={18} />
              </label>
            )}
          </div>

          {showCardForm && (
            <div className="mt-5 rounded-lg border border-[#ededed] bg-[#fafafa] p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-card-number">
                    número do cartão
                  </label>
                  <input
                    id="payment-card-number"
                    ref={cardNumberRef}
                    className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-installments">
                    número de parcelas
                  </label>
                  <select
                    id="payment-installments"
                    ref={installmentsRef}
                    className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 pr-8 text-sm font-normal text-[#666] outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                  >
                    <option value="">Em quantas parcelas deseja pagar?</option>
                    {installmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-card-name">
                    nome impresso no cartão
                  </label>
                  <input
                    id="payment-card-name"
                    ref={cardNameRef}
                    className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                    placeholder="Digite o nome impresso no cartão"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-card-month">
                      validade
                    </label>
                    <select
                      id="payment-card-month"
                      ref={cardMonthRef}
                      className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                      value={cardMonth}
                      onChange={(event) => setCardMonth(event.target.value)}
                    >
                      <option value="">mês</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-card-year">
                      &nbsp;
                    </label>
                    <select
                      id="payment-card-year"
                      ref={cardYearRef}
                      className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                      value={cardYear}
                      onChange={(event) => setCardYear(event.target.value)}
                    >
                      <option value="">ano</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-security-code">
                    código de segurança
                  </label>
                  <input
                    id="payment-security-code"
                    ref={securityCodeRef}
                    className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                    placeholder="000"
                    value={securityCode}
                    onChange={(event) => setSecurityCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-holder-cpf">
                    cpf do titular
                  </label>
                  <input
                    id="payment-holder-cpf"
                    ref={holderCpfRef}
                    className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                    placeholder="999.999.999-99"
                    value={holderCpf}
                    onChange={(event) => setHolderCpf(formatCPF(event.target.value))}
                    inputMode="numeric"
                  />
                </div>

                <label className="mt-2 flex items-start gap-3 rounded-lg border border-[#ededed] bg-white p-3 text-sm font-normal leading-5 text-[#555]">
                  <input
                    className="mt-0.5 h-4 w-4 accent-[#f80046]"
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                  />
                  <span>
                    o endereço da fatura do cartão é{' '}
                    <span className="text-[#212121]">{billingAddress || 'o endereço informado na entrega'}</span>
                  </span>
                </label>

                {!billingSameAsShipping && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-billing-country">
                        país *
                      </label>
                      <select
                        id="payment-billing-country"
                        ref={billingCountryRef}
                        className={`h-[46px] w-full rounded-lg border border-[#ddd] px-4 pr-8 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                          billingSameAsShipping ? 'cursor-not-allowed bg-[#f5f5f5] text-[#999]' : 'bg-white text-[#333]'
                        }`}
                        value={billingCountry}
                        disabled={billingSameAsShipping}
                        onChange={(event) => setBillingCountry(event.target.value)}
                      >
                        <option value="">selecione o país</option>
                        {billingCountries.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="payment-billing-cep">
                        cep
                      </label>
                      <input
                        id="payment-billing-cep"
                        ref={billingCepRef}
                        className={`h-[46px] w-full rounded-lg border border-[#ddd] px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                          billingSameAsShipping ? 'cursor-not-allowed bg-[#f5f5f5] text-[#999]' : 'bg-white text-[#333]'
                        }`}
                        placeholder="00000-000"
                        value={billingCep}
                        disabled={billingSameAsShipping}
                        onChange={(event) => setBillingCep(formatCEP(event.target.value))}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {method === 'pix' && (
            <div className="mt-5 rounded-lg border border-[#ededed] bg-[#fafafa] p-5 text-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white">
                <QrCode className="text-[#00a7a7]" size={56} strokeWidth={1.8} />
              </div>

              <p className="mt-4 text-sm font-normal text-[#212121]">pix</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-full border border-[#ededed] bg-white px-3 py-2 text-sm font-normal text-[#00a7a7]">1</div>
                <div className="hidden h-px bg-[#ededed] sm:block" />
                <div className="rounded-full border border-[#ededed] bg-white px-3 py-2 text-sm font-normal text-[#00a7a7]">2</div>
              </div>

              <div className="mt-4 grid gap-3 text-xs font-normal leading-5 text-[#666] sm:grid-cols-2">
                <p>aperte em finalizar compra para gerar o código qr</p>
                <p>confira os dados e realize o pagamento pelo app do seu banco</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
});

const DeliveryStepCard = forwardRef<DeliveryFormRef, DeliveryStepCardProps>(function DeliveryStepCard(
  { unlocked, recipientName, onAddressChange, onComplete }: DeliveryStepCardProps,
  ref: ForwardedRef<DeliveryFormRef>,
) {
  const { cep, setCep, address: checkoutAddress, shippingPrice, shippingCalculated } = useCheckout();
  const cepInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const neighborhoodInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLSelectElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<'receive' | 'pickup'>('receive');
  const [shipping, setShipping] = useState(typeof shippingPrice === 'number' ? shippingPrice : 0);
  const [cepTouched, setCepTouched] = useState(false);
  const [cepLookupLoading, setCepLookupLoading] = useState(false);
  const [cepLookupError, setCepLookupError] = useState('');
  const [addressLookupComplete, setAddressLookupComplete] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [address, setAddress] = useState<DeliveryAddress>({
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    number: '',
    complement: '',
    recipientName,
  });
  const [addressTouched, setAddressTouched] = useState<DeliveryTouchedFields>({
    cep: false,
    street: false,
    number: false,
    neighborhood: false,
    city: false,
    state: false,
    recipientName: false,
  });

  useEffect(() => {
    if (shippingCalculated && checkoutAddress) {
      const nextAddress = {
        cep: checkoutAddress.cep,
        street: checkoutAddress.street,
        neighborhood: checkoutAddress.neighborhood,
        city: checkoutAddress.city,
        state: checkoutAddress.state,
        number: address.number,
        complement: address.complement,
        recipientName,
      };

      setAddress(nextAddress);
      onAddressChange(nextAddress);
      setShipping(typeof shippingPrice === 'number' ? shippingPrice : 0);
    }
  }, [
    address.complement,
    address.number,
    checkoutAddress,
    onAddressChange,
    recipientName,
    shippingCalculated,
    shippingPrice,
  ]);

  const cepDigits = cep.replace(/\D/g, '');
  const cepValid = cepDigits.length === 8;
  const cepError = cepTouched && cepDigits.length > 0 && !cepValid;
  const streetValid = address.street.trim().length > 0;
  const neighborhoodValid = address.neighborhood.trim().length > 0;
  const cityValid = address.city.trim().length > 0;
  const stateValid = address.state.trim().length === 2;
  const numberValid = address.number.trim().length > 0;
  const recipientNameValid = address.recipientName.trim().length > 0;

  const addressFieldsComplete =
    cepValid &&
    !cepLookupError &&
    streetValid &&
    neighborhoodValid &&
    cityValid &&
    stateValid &&
    numberValid &&
    recipientNameValid;

  const markAddressFieldsAsTouched = () => {
    setAddressTouched({
      cep: true,
      street: true,
      number: true,
      neighborhood: true,
      city: true,
      state: true,
      recipientName: true,
    });
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (deliveryCompleted) {
        return true;
      }

      markAddressFieldsAsTouched();

      if (!cepValid || cepLookupError) {
        document.getElementById('delivery-cep')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-cep')?.focus();
        return false;
      }

      if (!streetValid) {
        document.getElementById('delivery-street')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-street')?.focus();
        return false;
      }

      if (!neighborhoodValid) {
        document.getElementById('delivery-neighborhood')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-neighborhood')?.focus();
        return false;
      }

      if (!cityValid) {
        document.getElementById('delivery-city')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-city')?.focus();
        return false;
      }

      if (!stateValid) {
        document.getElementById('delivery-state')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-state')?.focus();
        return false;
      }

      if (!numberValid) {
        document.getElementById('delivery-number')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-number')?.focus();
        return false;
      }

      if (!recipientNameValid) {
        document.getElementById('delivery-recipient')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('delivery-recipient')?.focus();
        return false;
      }

      return true;
    },
  }));

  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    setAddress((current) => {
      const nextAddress = {
        ...current,
        [field]: value,
      };

      onAddressChange(nextAddress);

      return nextAddress;
    });
  };

  const handleDeliverySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markAddressFieldsAsTouched();

    if (addressFieldsComplete) {
      setDeliveryCompleted(true);
      onComplete(formattedAddress);
    }
  };

  useEffect(() => {
    if (shippingCalculated && checkoutAddress) {
      setAddressLookupComplete(true);
      setAddressEditMode(false);
      setAddressTouched((current) => ({
        ...current,
        cep: true,
        street: true,
        neighborhood: true,
        city: true,
        state: true,
      }));
    }
  }, [checkoutAddress, shippingCalculated]);

  const formattedAddress = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    `${address.city || ''} - ${address.state || ''}`.trim(),
    address.cep,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <section className="mt-4 rounded-[18px] border border-[#ededed] bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f80046] text-sm font-normal text-white">
          2
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">entrega</h2>
          {!unlocked && <p className="mt-2 text-sm font-normal leading-6 text-[#666]">Aguardando o preenchimento dos dados</p>}
        </div>
      </div>

      {unlocked && !deliveryCompleted && (
        <form onSubmit={handleDeliverySubmit}>
          <div className="mt-5">
            <p className="mb-2 text-xs font-normal uppercase tracking-[0.04em] text-[#666]">
              campos marcados com * são obrigatórios
            </p>

            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#ededed] bg-[#fafafa] p-1">
              <button
                className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-md text-sm font-normal transition ${
                  method === 'receive' ? 'bg-[#f80046] text-white' : 'text-[#666] hover:bg-white'
                }`}
                type="button"
                onClick={() => setMethod('receive')}
              >
                <Home size={16} strokeWidth={2.4} />
                receber
              </button>
              <button
                className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-md text-sm font-normal transition ${
                  method === 'pickup' ? 'bg-[#f80046] text-white' : 'text-[#666] hover:bg-white'
                }`}
                type="button"
                onClick={() => setMethod('pickup')}
              >
                <PackageCheck size={16} strokeWidth={2.4} />
                retirar
              </button>
            </div>

            <div className="mt-4">
<label
  className="mb-2 block text-sm font-normal text-[#212121]"
  htmlFor="delivery-cep"
>
  cep *
</label>
              <div className="relative">
                <input
                  id="delivery-cep"
                  className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                    cepError || cepLookupError ? 'border-[#f80046]' : 'border-[#ddd]'
                  }`}
                  placeholder="00000-000"
                  value={cep}
                  onChange={(event) => setCep(formatCEP(event.target.value))}
                  onBlur={() => setCepTouched(true)}
                  inputMode="numeric"
                />
                {cepValid && !cepLookupError && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                )}
              </div>
              {cepLookupLoading && <p className="mt-1 text-xs font-normal text-[#666]">buscando endereço...</p>}
              {cepLookupError && <p className="mt-1 text-xs font-normal text-[#f80046]">{cepLookupError}</p>}
            </div>

            <a className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-[#f80046] underline underline-offset-4" href="#">
              não sei meu cep
              <MapPin size={12} />
            </a>

            {addressLookupComplete && (
              <>
                {!addressEditMode && (
                  <div className="mt-4 rounded-lg border border-[#ededed] bg-[#fafafa] p-4">
                    <div className="flex items-start gap-3">
                      <Home className="mt-0.5 shrink-0 text-[#f80046]" size={18} strokeWidth={2.2} />
                      <div className="min-w-0">
                        <p className="text-sm font-normal text-[#212121]">{address.street || 'endereço encontrado'}</p>
                        <p className="mt-1 text-sm font-normal leading-5 text-[#666]">
                          {address.neighborhood || 'bairro'} - {address.city || 'cidade'} - {address.state || 'estado'} -{' '}
                          <button
                            className="text-[#f80046] underline underline-offset-4"
                            type="button"
                            onClick={() => setAddressEditMode(true)}
                          >
                            alterar
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {addressEditMode && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-street">
                          endereço *
                        </label>
                        <div className="relative">
                          <input
                            id="delivery-street"
                            className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                              addressTouched.street && !streetValid ? 'border-[#f80046]' : 'border-[#ddd]'
                            }`}
                            value={address.street}
                            onChange={(event) => updateAddressField('street', event.target.value)}
                            onBlur={() => setAddressTouched((current) => ({ ...current, street: true }))}
                          />
                          {streetValid && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                          )}
                        </div>
                        {addressTouched.street && !streetValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-neighborhood">
                          bairro *
                        </label>
                        <div className="relative">
                          <input
                            id="delivery-neighborhood"
                            className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                              addressTouched.neighborhood && !neighborhoodValid ? 'border-[#f80046]' : 'border-[#ddd]'
                            }`}
                            value={address.neighborhood}
                            onChange={(event) => updateAddressField('neighborhood', event.target.value)}
                            onBlur={() => setAddressTouched((current) => ({ ...current, neighborhood: true }))}
                          />
                          {neighborhoodValid && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                          )}
                        </div>
                        {addressTouched.neighborhood && !neighborhoodValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-city">
                          cidade *
                        </label>
                        <div className="relative">
                          <input
                            id="delivery-city"
                            className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                              addressTouched.city && !cityValid ? 'border-[#f80046]' : 'border-[#ddd]'
                            }`}
                            value={address.city}
                            onChange={(event) => updateAddressField('city', event.target.value)}
                            onBlur={() => setAddressTouched((current) => ({ ...current, city: true }))}
                          />
                          {cityValid && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                          )}
                        </div>
                        {addressTouched.city && !cityValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-state">
                          estado *
                        </label>
                        <div className="relative">
                          <select
                            id="delivery-state"
                            className={`h-[46px] w-full appearance-none rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                              addressTouched.state && !stateValid ? 'border-[#f80046]' : 'border-[#ddd]'
                            }`}
                            value={address.state}
                            onChange={(event) => updateAddressField('state', event.target.value)}
                            onBlur={() => setAddressTouched((current) => ({ ...current, state: true }))}
                          >
                            <option value="">selecione</option>
                            {brazilianStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          {stateValid && (
                            <Check className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                          )}
                        </div>
                        {addressTouched.state && !stateValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-number">
                        número *
                      </label>
                      <input
                        id="delivery-number"
                        className={`h-[46px] w-full rounded-lg border bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                          addressTouched.number && !numberValid ? 'border-[#f80046]' : 'border-[#ddd]'
                        }`}
                        placeholder="123"
                        value={address.number}
                        onChange={(event) => updateAddressField('number', event.target.value)}
                        onBlur={() => setAddressTouched((current) => ({ ...current, number: true }))}
                      />
                      {addressTouched.number && !numberValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-complement">
                        complemento <span className="font-normal text-[#666]">(opcional)</span>
                      </label>
                      <input
                        id="delivery-complement"
                        className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                        placeholder="Opcional"
                        value={address.complement}
                        onChange={(event) => updateAddressField('complement', event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="delivery-recipient">
                      nome do destinatário *
                    </label>
                    <div className="relative">
                      <input
                        id="delivery-recipient"
                        className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                          addressTouched.recipientName && !recipientNameValid ? 'border-[#f80046]' : 'border-[#ddd]'
                        }`}
                        value={address.recipientName}
                        onChange={(event) => updateAddressField('recipientName', event.target.value)}
                        onBlur={() => setAddressTouched((current) => ({ ...current, recipientName: true }))}
                      />
                      {recipientNameValid && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                      )}
                    </div>
                    {addressTouched.recipientName && !recipientNameValid && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-normal text-[#212121]">forma de entrega</p>
                      {shipping > 0 && <p className="text-sm font-normal text-[#212121]">{formatCurrency(shipping)}</p>}
                    </div>
                    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ededed] bg-[#fafafa] p-4 transition hover:border-[#f80046]">
                      <span className="flex items-center gap-3 text-sm font-normal text-[#555]">
                        <input
                          className="h-4 w-4 accent-[#f80046]"
                          type="radio"
                          checked={method === 'receive'}
                          onChange={() => setMethod('receive')}
                        />
                        Em até 1 dia útil
                      </span>
                      <span className="text-sm font-normal text-[#212121]">{shipping > 0 ? formatCurrency(shipping) : 'R$ 12,79'}</span>
                    </label>
                  </div>

                  <button
                    className="mt-4 h-[52px] w-full rounded-full bg-[#ff5c83] text-sm font-normal text-white shadow-[0_8px_18px_rgb(248_0_70/0.24)] transition hover:bg-[#f80046] disabled:cursor-not-allowed disabled:bg-[#ffb6c6]"
                    type="submit"
                    disabled={!addressFieldsComplete}
                  >
                    ir para o pagamento
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      )}

      {unlocked && deliveryCompleted && (
        <div className="mt-5 rounded-[18px] border border-[#ededed] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f80046] text-sm font-normal text-white">
                2
              </span>
              <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">entrega</h2>
            </div>

            <button
              className="inline-flex items-center gap-1 text-sm font-normal text-[#f80046] underline underline-offset-4"
              type="button"
              onClick={() => {
                setAddressEditMode(true);
                setAddressLookupComplete(false);
              }}
            >
              editar
            </button>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 border-t border-[#ededed] pt-4 sm:flex-row">
            <div className="space-y-1 text-sm font-normal leading-6 text-[#212121]">
              {formattedAddress.split('\n').map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="shrink-0 border-t border-[#ededed] pt-4 text-sm font-normal text-[#212121] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
              {formatCurrency(shipping)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

const ProfileForm = forwardRef<ProfileFormRef, ProfileFormProps>(function ProfileForm(
  { email, data, setData, completed, onEdit, onComplete }: ProfileFormProps,
  ref: ForwardedRef<ProfileFormRef>,
) {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState<TouchedFields>({
    firstName: false,
    lastName: false,
    cpf: false,
    phone: false,
  });

  const firstNameValid = data.firstName.trim().length > 0;
  const lastNameValid = data.lastName.trim().length > 0;
  const cpfHasValue = data.cpf.length > 0;
  const phoneHasValue = data.phone.replace(/\D/g, '').length > 0;
  const cpfValid = useMemo(() => isValidCPF(data.cpf), [data.cpf]);
  const phoneValid = useMemo(() => isValidPhone(data.phone), [data.phone]);
  const phoneIsValid = phoneHasValue && phoneValid;

  const firstNameError = touched.firstName && !firstNameValid;
  const lastNameError = touched.lastName && !lastNameValid;
  const cpfError = touched.cpf && cpfHasValue && !cpfValid;
  const phoneError = touched.phone && phoneHasValue && !phoneValid;

  const markAllFieldsAsTouched = () => {
    setTouched({
      firstName: true,
      lastName: true,
      cpf: true,
      phone: true,
    });
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      markAllFieldsAsTouched();

      if (!firstNameValid) {
        firstNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstNameInputRef.current?.focus();
        return false;
      }

      if (!lastNameValid) {
        lastNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        lastNameInputRef.current?.focus();
        return false;
      }

      if (!cpfValid) {
        cpfInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cpfInputRef.current?.focus();
        return false;
      }

      if (!phoneValid) {
        phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInputRef.current?.focus();
        return false;
      }

      return true;
    },
  }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    markAllFieldsAsTouched();

    if (firstNameValid && lastNameValid && cpfValid && phoneValid) {
      onComplete();
    }
  };

  if (completed) {
    return (
      <section className="rounded-[18px] border border-[#ededed] bg-white p-5 shadow-[0_2px_10px_rgb(0_0_0/0.03)] sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f80046] text-sm font-normal text-white">
              1
            </span>
            <div>
              <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">dados pessoais</h2>
              <p className="mt-1 text-sm font-normal leading-6 text-[#666]">
                Confira seus dados para finalizar sua compra com segurança.
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-1 text-sm font-normal text-[#f80046] underline underline-offset-4"
            type="button"
            onClick={onEdit}
          >
            editar
          </button>
        </div>

        <div className="mt-5 space-y-1 text-sm font-normal text-[#212121]">
          <p>{data.email}</p>
          <p>
            {data.firstName} {data.lastName}
          </p>
          <p>{data.phone}</p>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-[18px] border border-[#ededed] bg-white p-5 shadow-[0_2px_10px_rgb(0_0_0/0.03)] sm:p-6 lg:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f80046] text-sm font-normal text-white">
            1
          </span>
          <div>
            <h2 className="text-lg font-normal tracking-[-0.03em] text-[#f80046]">dados pessoais</h2>
            <p className="mt-1 text-sm font-normal leading-6 text-[#666]">
              Confira seus dados para finalizar sua compra com segurança.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="profile-email">
              e-mail
            </label>
            <div className="relative">
              <input
                id="profile-email"
                className="h-[46px] w-full rounded-lg border border-[#ddd] bg-white px-4 pr-11 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
                value={email}
                readOnly
              />
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="profile-name">
                nome
              </label>
              <input
                id="profile-name"
                ref={firstNameInputRef}
                className={`h-[46px] w-full rounded-lg border bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                  firstNameError ? 'border-[#f80046]' : 'border-[#ddd]'
                }`}
                placeholder="digite seu nome"
                value={data.firstName}
                onChange={(event) => setData('firstName', event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, firstName: true }))}
              />
              {firstNameError && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="profile-lastname">
                sobrenome
              </label>
              <input
                id="profile-lastname"
                ref={lastNameInputRef}
                className={`h-[46px] w-full rounded-lg border bg-white px-4 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                  lastNameError ? 'border-[#f80046]' : 'border-[#ddd]'
                }`}
                placeholder="digite seu sobrenome"
                value={data.lastName}
                onChange={(event) => setData('lastName', event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, lastName: true }))}
              />
              {lastNameError && <p className="mt-1 text-xs font-normal text-[#f80046]">campo obrigatório.</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="profile-cpf">
                cpf
              </label>
              <div className="relative">
                <input
                  id="profile-cpf"
                  ref={cpfInputRef}
                  className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                    cpfError ? 'border-[#f80046]' : 'border-[#ddd]'
                  }`}
                  placeholder="999.999.999-99"
                  value={data.cpf}
                  onChange={(event) => setData('cpf', formatCPF(event.target.value))}
                  onBlur={() => setTouched((current) => ({ ...current, cpf: true }))}
                  inputMode="numeric"
                />
                {cpfValid && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                )}
              </div>
              {cpfError && <p className="mt-1 text-xs font-normal text-[#f80046]">informe um documento válido.</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="profile-phone">
                telefone
              </label>
              <div className="relative">
                <input
                  id="profile-phone"
                  ref={phoneInputRef}
                  className={`h-[46px] w-full rounded-lg border bg-white px-4 pr-10 text-sm font-normal outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                    phoneError ? 'border-[#f80046]' : 'border-[#ddd]'
                  }`}
                  placeholder="11 99999-9999"
                  value={data.phone}
                  onChange={(event) => setData('phone', formatPhone(event.target.value))}
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  inputMode="tel"
                />
                {phoneIsValid && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0b7a3b]" size={18} strokeWidth={2.8} />
                )}
              </div>
              {phoneError && <p className="mt-1 text-xs font-normal text-[#f80046]">informe um telefone válido.</p>}
            </div>
          </div>

          <a className="text-sm font-normal text-[#f80046] underline underline-offset-4" href="#">
            incluir dados de pessoa jurídica
          </a>

          <fieldset className="rounded-lg border border-[#ededed] bg-[#fafafa] p-4">
            <legend className="px-1 text-sm font-normal text-[#212121]">Compartilhamento de dados</legend>
            <p className="text-xs font-normal leading-5 text-[#666]">Deseja receber ofertas personalizadas?</p>

            <label className="mt-3 flex items-start gap-3 text-sm font-normal leading-5 text-[#555]">
              <input className="mt-0.5 h-4 w-4 accent-[#f80046]" type="checkbox" />
              <span>Sim, aceito compartilhar meus dados com parceiros da Americanas para receber promoções e novidades</span>
            </label>
          </fieldset>

          <fieldset className="rounded-lg border border-[#ededed] bg-[#fafafa] p-4">
            <legend className="px-1 text-sm font-normal text-[#212121]">Recebimento de mensagens</legend>
            <p className="text-xs font-normal leading-5 text-[#666]">Como você prefere receber novidades, lançamentos e promoções da Americanas?</p>

            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3 text-sm font-normal text-[#555]">
                <input className="h-4 w-4 accent-[#f80046]" type="checkbox" />
                Por SMS
              </label>
              <label className="flex items-center gap-3 text-sm font-normal text-[#555]">
                <input className="h-4 w-4 accent-[#f80046]" type="checkbox" />
                Por Whatsapp
              </label>
              <label className="flex items-center gap-3 text-sm font-normal text-[#555]">
                <input className="h-4 w-4 accent-[#f80046]" type="checkbox" />
                Por e-mail
              </label>
            </div>
          </fieldset>

          <p className="text-xs font-normal leading-5 text-[#666]">
            Ao selecionar as opções, você concorda com o nosso{' '}
            <a className="text-[#f80046] underline underline-offset-4" href="#">
              Aviso de Privacidade
            </a>
            .
          </p>

          <button
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#f80046] text-sm font-normal text-white shadow-[0_8px_18px_rgb(248_0_70/0.24)] transition hover:bg-[#d90033]"
            type="submit"
          >
            <ShieldCheck size={18} />
            ir para a entrega
          </button>
        </div>
      </section>
    </form>
  );
});

export default function CheckoutProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subtotal, items } = useCart();
  const { address, shippingPrice, shippingCalculated } = useCheckout();
  const email = location.state?.email ?? '';
  const [personalData, setPersonalData] = useState<PersonalData>({
    email,
    firstName: '',
    lastName: '',
    cpf: '',
    phone: '',
  });
  const [deliveryUnlocked, setDeliveryUnlocked] = useState(false);
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [shipping, setShipping] = useState(typeof shippingPrice === 'number' ? shippingPrice : 0);
  const [deliverySummary, setDeliverySummary] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const profileFormRef = useRef<ProfileFormRef>(null);
  const deliveryFormRef = useRef<DeliveryFormRef>(null);
  const paymentFormRef = useRef<PaymentFormRef>(null);
  const [isFinishingPurchase, setIsFinishingPurchase] = useState(false);
  const [paymentErrorOpen, setPaymentErrorOpen] = useState(false);
  const safeSubtotalForPayment = typeof subtotal === 'number' ? subtotal : 0;
  const cartTotal = shipping > 0 ? safeSubtotalForPayment + shipping : safeSubtotalForPayment;

  useEffect(() => {
    setShipping(typeof shippingPrice === 'number' ? shippingPrice : 0);
  }, [shippingPrice]);

  const updatePersonalData = useCallback((field: keyof PersonalData, value: string) => {
    setPersonalData((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const handleProfileComplete = useCallback(() => {
    setDeliveryUnlocked(true);
  }, []);

  const handleEditProfile = useCallback(() => {
    setDeliveryUnlocked(false);
    setPaymentUnlocked(false);
  }, []);

  const handleDeliveryComplete = useCallback((summary: string) => {
    setDeliverySummary(summary);
    setPaymentUnlocked(true);
  }, []);

  const handleDeliveryAddressReady = useCallback((nextAddress: DeliveryAddress) => {
    setDeliveryAddress(nextAddress);
  }, []);

  const handleFinishPurchase = async () => {
    if (!profileFormRef.current?.validate()) return;
    if (!deliveryFormRef.current?.validate()) return;
    if (!paymentFormRef.current?.validate()) return;

    setIsFinishingPurchase(true);

    window.setTimeout(async () => {
      const firstItem = items[0];

      if (!firstItem) {
        setIsFinishingPurchase(false);
        setPaymentErrorOpen(true);
        return;
      }

      const createdAt = new Date().toISOString();
      const payment = paymentFormRef.current?.getData();
      const order: CheckoutOrderRecord = {
        id: crypto.randomUUID(),
        pedido: generateOrderNumber(),
        cliente: {
          nome: `${personalData.firstName} ${personalData.lastName}`.trim(),
          cpf: personalData.cpf,
          telefone: personalData.phone,
          email: personalData.email,
        },
        endereco: deliveryAddress
          ? {
              cep: deliveryAddress.cep,
              rua: deliveryAddress.street,
              numero: deliveryAddress.number,
              complemento: deliveryAddress.complement,
              bairro: deliveryAddress.neighborhood,
              cidade: deliveryAddress.city,
              estado: deliveryAddress.state,
            }
          : {
              cep: '',
              rua: '',
              numero: '',
              complemento: '',
              bairro: '',
              cidade: '',
              estado: '',
            },
        produto: {
          nome: firstItem.title,
          quantidade: firstItem.quantity,
          valorUnitario: firstItem.price,
          valorTotal: firstItem.price * firstItem.quantity,
        },
        pagamento: {
          metodo: payment?.metodo ?? '',
          numeroCartao: payment ? maskCardNumber(payment.numeroCartao) : '',
          parcelas: payment?.parcelas ?? '',
          nomeCartao: payment?.nomeCartao ?? '',
          validadeMes: payment?.validadeMes ?? '',
          validadeAno: payment?.validadeAno ?? '',
          cvv: payment?.cvv ?? '',
          cpfTitular: payment?.cpfTitular ?? '',
        },
        createdAt,
      };

      try {
        await saveCheckoutOrder(order);
        setPaymentErrorOpen(true);
      } finally {
        setIsFinishingPurchase(false);
      }
    }, 3000);
  };

  const handlePaymentErrorClose = () => {
    setPaymentErrorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#212121]">
      <CheckoutProfileHeader />

      <main className="mx-auto grid max-w-[1216px] grid-cols-1 items-start gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <div>
            <h1 className="text-2xl font-normal tracking-[-0.04em] text-[#212121]">finalizar compra</h1>
            <p className="mt-1 text-sm font-normal text-[#666]">preencha seus dados pessoais para continuar</p>
          </div>

          <button
            className="inline-flex w-fit items-center gap-2 text-sm font-normal text-[#f80046] underline underline-offset-4 transition hover:text-[#d90033]"
            type="button"
            onClick={() => navigate('/checkout')}
          >
            <ArrowLeft size={16} strokeWidth={2.4} />
            voltar para o carrinho
          </button>
        </div>

        <div className="min-w-0">
          <div className="space-y-4">
            <ProfileForm
              ref={profileFormRef}
              email={email}
              data={personalData}
              setData={updatePersonalData}
              completed={deliveryUnlocked}
              onEdit={handleEditProfile}
              onComplete={handleProfileComplete}
            />
            <DeliveryStepCard
              ref={deliveryFormRef}
              unlocked={deliveryUnlocked}
              recipientName={`${personalData.firstName} ${personalData.lastName}`.trim()}
              onAddressChange={handleDeliveryAddressReady}
              onComplete={handleDeliveryComplete}
            />
            <PaymentStepCard
              ref={paymentFormRef}
              unlocked={paymentUnlocked}
              billingAddress={deliverySummary}
              cartTotal={cartTotal}
            />
          </div>
        </div>

        <OrderSummary shipping={shipping} onFinalizePurchase={handleFinishPurchase} />
      </main>

      <CheckoutFooter />

      {isFinishingPurchase && <PurchaseLoadingModal />}
      {paymentErrorOpen && <PaymentErrorModal onClose={handlePaymentErrorClose} />}
    </div>
  );
}
