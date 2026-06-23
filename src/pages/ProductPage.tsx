import {
  Battery,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Cpu,
  Heart,
  MapPin,
  Menu,
  Minus,
  MonitorSmartphone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  User,
  X,
  ZoomIn,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { MobileHeader } from '../components/Header/MobileHeader';
import { Footer } from '../components/Footer/Footer';
import { InitialOfferModal } from '../components/InitialOfferModal/InitialOfferModal';
import { RegionModal } from '../components/InitialOfferModal/RegionModal';
import { useCart } from '../context/CartContext';
import { useStoredProducts } from '../hooks/useStoredProducts';
import { type Product } from '../data/products';
import { getProductPath } from '../utils/productUrl';

type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

type HighlightIconName = 'screen' | 'hz' | 'camera' | 'ip' | 'battery' | 'cpu' | 'storage' | 'android';

type HighlightIcon = {
  icon: HighlightIconName;
  Component: typeof MonitorSmartphone;
};

type RelatedProduct = Product;

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR');
}

function getProductImages(product: Product): ProductImage[] {
  const images = product.images.length > 0 ? product.images : [product.image];

  return images.map((image, index) => ({
    id: `image-${index + 1}`,
    src: image,
    alt: `${product.title} - imagem ${index + 1}`,
  }));
}

function Stars({ rating, size = 14, className = '' }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < Math.round(rating) ? '#ffb000' : '#ddd'}
          stroke={index < Math.round(rating) ? '#ffb000' : '#ddd'}
        />
      ))}
    </div>
  );
}

function ProductHeader() {
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f80046] text-white shadow-sm">
      <div className="mx-auto flex h-[54px] w-full max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <a className="text-[26px] font-black leading-none tracking-[-0.065em] underline underline-offset-4" href="/" aria-label="Americanas home">
          americanas
        </a>

        <form className="relative min-w-[260px] flex-1 lg:min-w-[520px]" role="search" onSubmit={handleSearch}>
          <input
            className="h-[42px] w-full rounded-full border-0 bg-white px-5 pr-12 text-sm font-semibold text-[#777] outline-none placeholder:text-[#9ca3af]"
            placeholder="busque aqui seu produto"
            aria-label="Buscar produtos"
          />
          <button className="absolute right-2 top-1/2 grid h-[34px] w-[34px] -translate-y-1/2 place-items-center rounded-full text-[#f80046]" type="submit" aria-label="Buscar">
            <Search size={20} strokeWidth={2.4} />
          </button>
        </form>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="flex items-center gap-1 text-sm font-semibold" type="button">
            <MapPin size={17} strokeWidth={2.4} />
            informe seu cep
          </button>
          <a className="flex items-center gap-1 text-sm font-semibold" href="/login">
            <User size={19} strokeWidth={2.2} />
            login
          </a>
          <a className="flex items-center gap-1 text-sm font-semibold" href="#" aria-label="Favoritos">
            <Heart size={19} strokeWidth={2.2} />
            favoritos
          </a>
          <a className="relative flex items-center gap-1 text-sm font-semibold" href="/carrinho" aria-label="Carrinho">
            <ShoppingCart size={19} strokeWidth={2.2} />
            carrinho
            <span className="absolute -right-2 -top-2 grid min-h-[16px] w-[16px] place-items-center rounded-full bg-[#b20031] px-0 text-[9px] font-black leading-none text-white">1</span>
          </a>
        </div>

        <div className="ml-auto flex items-center gap-[9px] lg:hidden">
          <a className="grid h-[28px] w-[28px] place-items-center text-white" href="/login" aria-label="Login">
            <User size={22} strokeWidth={2.2} />
          </a>
          <a className="grid h-[28px] w-[28px] place-items-center text-white" href="#" aria-label="Presentes">
            <Heart size={22} strokeWidth={2.2} />
          </a>
          <a className="relative grid h-[28px] w-[28px] place-items-center text-white" href="/carrinho" aria-label="Carrinho">
            <ShoppingCart size={22} strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 grid min-h-[15px] w-[15px] place-items-center rounded-full bg-[#b20031] px-0 text-[9px] font-black leading-none text-white">1</span>
          </a>
          <button className="grid h-[34px] w-[34px] place-items-center rounded-md text-white" type="button" aria-label="Abrir menu">
            <Menu size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <nav className="border-t border-white/10 bg-[#f80046] text-white">
        <div className="mx-auto flex h-[44px] max-w-[1440px] items-center gap-6 overflow-x-auto px-4 text-sm font-semibold lg:px-6">
          {['ofertas do dia', 'marketplace', 'celulares', 'informática', 'eletrodomésticos', 'móveis', 'tv e áudio', 'games'].map((category) => (
            <a className="shrink-0 whitespace-nowrap" key={category} href="#">
              {category}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Breadcrumb({ product }: { product: Product }) {
  const crumbs = [
    { label: 'americanas', href: '/' },
    { label: product.brand.toLowerCase(), href: '#' },
    { label: product.title.toLowerCase(), href: '#' },
  ];

  return (
    <nav className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-3 text-xs text-[#666] lg:px-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex shrink-0 items-center gap-2">
          <a className="font-medium hover:text-[#f80046]" href={crumb.href}>
            {crumb.label}
          </a>
          {index < crumbs.length - 1 && <ChevronRight size={14} className="text-[#999]" />}
        </div>
      ))}
    </nav>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => getProductImages(product), [product]);
  const [selectedId, setSelectedId] = useState(images[0].id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedIndex = Math.max(0, images.findIndex((image) => image.id === selectedId));
  const selectedImage = images[selectedIndex] ?? images[0];
  const selectedThumb = useMemo(() => images.find((image) => image.id === selectedId), [images, selectedId]);

  const showNext = () => setSelectedId(images[(selectedIndex + 1) % images.length].id);
  const showPrevious = () => setSelectedId(images[(selectedIndex - 1 + images.length) % images.length].id);

  return (
    <section className="relative">
      <div className="grid gap-4 md:grid-cols-[92px_1fr]">
        <div className="order-2 grid grid-cols-4 gap-2 md:order-1 md:grid-cols-1 md:gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className={`group relative aspect-square overflow-hidden rounded-xl border bg-white ${image.id === selectedId ? 'border-[#f80046] ring-2 ring-[#f80046]/20' : 'border-[#e5e5e5]'}`}
              aria-label={`Ver ${image.alt}`}
            >
              <img className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105" src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>

        <div className="order-1 relative overflow-hidden rounded-[24px] border border-[#ededed] bg-white md:order-2">
          <button type="button" onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#212121] shadow-sm backdrop-blur">
            <ZoomIn size={18} />
          </button>

          <button type="button" onClick={showPrevious} className="absolute left-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#212121] shadow-sm backdrop-blur" aria-label="Imagem anterior">
            <ChevronLeft size={24} />
          </button>
          <button type="button" onClick={showNext} className="absolute right-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#212121] shadow-sm backdrop-blur" aria-label="Próxima imagem">
            <ChevronRight size={24} />
          </button>

          <div className="grid min-h-[360px] place-items-center px-6 py-8 md:min-h-[560px]">
            <img className="max-h-[320px] w-auto cursor-zoom-in object-contain transition-transform duration-300 hover:scale-[1.04] md:max-h-[480px]" src={selectedImage.src} alt={selectedImage.alt} loading="eager" />
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox images={images} selectedImage={selectedThumb ?? images[0]} onClose={() => setLightboxOpen(false)} />
      )}
    </section>
  );
}

function Lightbox({ images, selectedImage, onClose }: { images: ProductImage[]; selectedImage: ProductImage; onClose: () => void }) {
  const [index, setSelectedIndex] = useState(Math.max(0, images.findIndex((image) => image.id === selectedImage.id)));
  const current = images[index] ?? images[0];

  const go = (direction: -1 | 1) => setSelectedIndex((currentIndex) => (currentIndex + direction + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ampliar imagem do produto">
      <button className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-[#212121]" type="button" onClick={onClose} aria-label="Fechar lightbox">
        <X size={24} />
      </button>

      <button className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#212121] shadow-lg" type="button" onClick={() => go(-1)} aria-label="Imagem anterior">
        <ChevronLeft size={28} />
      </button>
      <button className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#212121] shadow-lg" type="button" onClick={() => go(1)} aria-label="Próxima imagem">
        <ChevronRight size={28} />
      </button>

      <div className="mx-auto flex h-full max-w-5xl items-center justify-center">
        <img className="max-h-[82vh] w-auto rounded-2xl object-contain" src={current.src} alt={current.alt} />
      </div>
    </div>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const [cep, setCep] = useState('');
  const pixPrice = product.price * 0.95;
  const cashback = product.price * 0.01;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#f80046]">{product.brand}</p>

      <h1 className="mt-2 text-[22px] font-semibold leading-snug text-[#212121] md:text-[28px]">
        {product.title}
      </h1>

      <dl className="mt-4 grid gap-2 text-xs text-[#666] md:flex md:flex-wrap">
        <div>
          <dt className="font-semibold text-[#444]">Código do produto</dt>
          <dd>{product.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[#444]">Código Americanas</dt>
          <dd>{String(product.id).padStart(13, '0')}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <Stars rating={product.rating} />
        <strong className="text-[#212121]">{product.rating.toFixed(1)}</strong>
        <span className="text-[#666]">({formatNumber(product.reviews)} avaliações)</span>
        <a className="font-semibold text-[#f80046]" href="#avaliacoes">
          ver avaliações
        </a>
      </div>

      <div className="mt-5 rounded-[18px] bg-[#fff1f3] p-4 md:bg-white md:p-0">
        {product.oldPrice > product.price && <p className="text-sm text-[#999] line-through">{formatCurrency(product.oldPrice)}</p>}
        <p className="text-[34px] font-black leading-none tracking-[-0.045em] text-[#f80046] md:text-[42px]">{formatCurrency(product.price)}</p>
        <p className="mt-3 text-sm font-semibold text-[#555]">ou {formatCurrency(pixPrice)} no Pix</p>
        <p className="mt-1 text-sm font-semibold text-[#555]">{product.installments} no cartão</p>
        <p className="mt-3 text-sm font-semibold text-[#0b7a3b]">{formatCurrency(cashback)} de cashback Ame Digital</p>
      </div>

      <form className="mt-5 flex gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 text-[#999]" size={18} />
          <input
            className="h-[44px] w-full rounded-lg border border-[#ddd] pl-10 pr-3 text-sm outline-none focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/15"
            placeholder="Digite seu CEP"
            value={cep}
            onChange={(event) => setCep(event.target.value)}
            aria-label="Digite seu CEP"
          />
        </div>
        <button className="h-[44px] rounded-lg border-2 border-[#f80046] px-5 text-sm font-black text-[#f80046] transition hover:bg-[#fff1f3]" type="submit">
          consultar
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#555]">
        <span className="rounded-full bg-[#f4f4f4] px-3 py-2">vende e entrega: Americanas</span>
        <span className="rounded-full bg-[#e6f7ec] px-3 py-2 text-[#0b7a3b]">produto novo</span>
      </div>
    </section>
  );
}

function BuyBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const { addToCart } = useCart();
  const pixPrice = product.price * 0.95;

  const changeQuantity = (next: number) => setQuantity((current) => Math.max(1, Math.min(10, current + next)));

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) {
      addToCart(product);
    }
  };

  return (
    <aside className="rounded-[22px] border border-[#ededed] bg-white p-4 shadow-[0_8px_28px_rgb(0_0_0/0.06)] md:p-5">
      <p className="text-[28px] font-black tracking-[-0.045em] text-[#f80046] md:text-[34px]">{formatCurrency(product.price)}</p>
      <p className="mt-1 text-sm font-semibold text-[#555]">ou {formatCurrency(pixPrice)} no Pix</p>
      <p className="mt-1 text-sm font-semibold text-[#555]">{product.installments} no cartão</p>
      <p className="mt-3 text-sm font-semibold text-[#0b7a3b]">{formatCurrency(product.price * 0.01)} de cashback Ame Digital</p>

      <div className="my-5 border-t border-[#ededed]" />

      <div>
        <label className="text-sm font-semibold text-[#212121]" htmlFor="delivery-cep">
          CEP de entrega
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 text-[#999]" size={17} />
            <input
              id="delivery-cep"
              className="h-[42px] w-full rounded-lg border border-[#ddd] pl-10 pr-3 text-sm outline-none focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/15"
              placeholder="00000-000"
              value={cep}
              onChange={(event) => setCep(event.target.value)}
            />
          </div>
          <button className="rounded-lg border-2 border-[#f80046] px-4 text-sm font-black text-[#f80046] transition hover:bg-[#fff1f3]" type="button">
            OK
          </button>
        </div>
        <p className="mt-2 text-xs text-[#777]">Informe seu CEP para calcular prazo e valor de entrega.</p>
      </div>

      <div className="my-5 border-t border-[#ededed]" />

      <div className="flex items-center gap-3 text-sm font-semibold text-[#212121]">
        <Truck className="text-[#f80046]" size={20} />
        <span>Retirada grátis em loja selecionada</span>
      </div>

      <div className="my-5 border-t border-[#ededed]" />

      <div>
        <label className="text-sm font-semibold text-[#212121]" htmlFor="quantity">
          Quantidade
        </label>
        <div className="mt-2 flex h-11 w-full overflow-hidden rounded-lg border border-[#ddd]">
          <button className="grid w-11 place-items-center text-[#212121]" type="button" onClick={() => changeQuantity(-1)} aria-label="Diminuir quantidade">
            <Minus size={18} />
          </button>
          <input id="quantity" className="h-full flex-1 border-x border-[#ededed] text-center text-sm font-semibold outline-none" value={quantity} readOnly />
          <button className="grid w-11 place-items-center text-[#212121]" type="button" onClick={() => changeQuantity(1)} aria-label="Aumentar quantidade">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <button className="h-[54px] rounded-full bg-[#f80046] text-base font-black text-white shadow-[0_8px_18px_rgb(248_0_70/0.24)] transition hover:bg-[#d90033]" type="button">
          Comprar Agora
        </button>
        <button className="flex h-[54px] items-center justify-center gap-2 rounded-full border-2 border-[#f80046] bg-white text-base font-black text-[#f80046] transition hover:bg-[#fff1f3]" type="button" onClick={handleAddToCart}>
          <ShoppingCart size={20} />
          Adicionar ao Carrinho
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#777]">
        Este produto é vendido e entregue por <strong className="text-[#212121]">Americanas</strong>. A Americanas oferece garantia contra defeito de fabricação.
      </p>
    </aside>
  );
}

function BenefitsSection() {
  const benefits = [
    { icon: Truck, title: 'Entrega rápida', text: 'Receba no conforto da sua casa com prazos disponíveis para todo o Brasil.' },
    { icon: ShieldCheck, title: 'Compra segura', text: 'Seus dados protegidos do início ao fim da compra.' },
    { icon: CheckCircle, title: 'Garantia', text: 'Produto novo com garantia contra defeitos de fabricação.' },
    { icon: RotateCcw, title: 'Troca fácil', text: 'Devolução e troca simplificadas dentro das condições do site.' },
    { icon: CreditCard, title: 'Pagamento facilitado', text: 'Pix, cartão de crédito e condições especiais Cliente A.' },
  ];

  return (
    <section className="border-y border-[#ededed] bg-white py-5">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-4 md:grid-cols-5 lg:px-6">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="rounded-2xl bg-[#fafafa] p-4">
              <Icon className="text-[#f80046]" size={24} />
              <h2 className="mt-3 text-sm font-black text-[#212121]">{benefit.title}</h2>
              <p className="mt-1 text-xs leading-5 text-[#666]">{benefit.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const highlightIcons: HighlightIcon[] = [
  { icon: 'screen', Component: MonitorSmartphone },
  { icon: 'hz', Component: Sparkles },
  { icon: 'camera', Component: Camera },
  { icon: 'ip', Component: ShieldCheck },
  { icon: 'battery', Component: Battery },
  { icon: 'cpu', Component: Cpu },
  { icon: 'storage', Component: Smartphone },
  { icon: 'android', Component: Smartphone },
];

function HighlightIcon({ icon }: { icon: HighlightIconName }) {
  const icons: Record<HighlightIconName, HighlightIcon['Component']> = {
    screen: MonitorSmartphone,
    hz: Sparkles,
    camera: Camera,
    ip: ShieldCheck,
    battery: Battery,
    cpu: Cpu,
    storage: Smartphone,
    android: Smartphone,
  };
  const Icon = icons[icon];
  return <Icon size={24} />;
}

function HighlightsSection({ specifications }: { specifications: Product['specifications'] }) {
  const highlights = Object.entries(specifications).slice(0, 8);

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">destaques</p>
          <h2 className="mt-1 text-2xl font-black text-[#212121]">Tudo que você precisa saber</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {highlights.map(([label, value], index) => {
            const highlightIcon = highlightIcons[index % highlightIcons.length];
            const Icon = highlightIcon.Component;
            return (
              <div key={label} className="rounded-[20px] border border-[#ededed] bg-[#fafafa] p-4 transition hover:-translate-y-1 hover:shadow-[0_10px_26px_rgb(0_0_0/0.06)]">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#f80046] shadow-sm">
                  <Icon size={24} />
                </div>
                <p className="mt-4 text-xl font-black tracking-[-0.04em] text-[#212121]">{label}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#777]">{value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DescriptionSection({ product }: { product: Product }) {
  const cards = Object.entries(product.specifications).slice(0, 4);
  const cardIcons = [MonitorSmartphone, Camera, Battery, Cpu];

  return (
    <section className="bg-[#fafafa] py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_28px_rgb(0_0_0/0.05)]">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">descrição</p>
            <h2 className="mt-2 text-2xl font-black text-[#212121]">{product.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#444]">
              {product.description}
            </p>
            <p className="mt-4 text-base leading-7 text-[#444]">
              Produto selecionado na Americanas com informações de marca, preço, avaliações e especificações atualizadas para facilitar sua compra.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#f80046] p-6 text-white">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-white/80">cliente a</p>
            <h3 className="mt-2 text-3xl font-black leading-none tracking-[-0.05em]">Ofertas exclusivas no app</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/90">
              Aproveite condições especiais, cashback e benefícios para pagar ainda menos no {product.title}.
            </p>
            <button className="mt-6 h-12 rounded-full bg-white px-6 text-sm font-black text-[#f80046] transition hover:bg-[#fff1f3]" type="button">
              ver benefícios
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(([title, value], index) => {
            const Icon = cardIcons[index % cardIcons.length];
            return (
              <div key={title} className="rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgb(0_0_0/0.05)]">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#fff1f3] text-[#f80046]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-base font-black text-[#212121]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#555]">{value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Specifications({ specifications }: { specifications: Product['specifications'] }) {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">especificações</p>
          <h2 className="mt-1 text-2xl font-black text-[#212121]">Ficha técnica completa</h2>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#ededed]">
          {Object.entries(specifications).map(([category, value]) => (
            <div key={category} className="border-b border-[#ededed] last:border-b-0">
              <h3 className="bg-[#fafafa] px-4 py-3 text-sm font-black text-[#212121]">{category}</h3>
              <div className="grid gap-2 border-t border-[#ededed] px-4 py-3 text-sm md:grid-cols-[220px_1fr]">
                <dt className="font-semibold text-[#555]">{category}</dt>
                <dd className="text-[#212121]">{value}</dd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ product }: { product: Product }) {
  const distribution = [
    { stars: 5, percent: Math.max(0, Math.round(product.rating * 15)) },
    { stars: 4, percent: 14 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 2 },
    { stars: 1, percent: 1 },
  ];

  return (
    <section id="avaliacoes" className="bg-white py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">avaliações</p>
          <h2 className="mt-1 text-2xl font-black text-[#212121]">O que os clientes dizem</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[24px] border border-[#ededed] bg-[#fafafa] p-6">
            <p className="text-5xl font-black tracking-[-0.06em] text-[#212121]">{product.rating.toFixed(1)}</p>
            <Stars rating={product.rating} size={18} className="mt-2" />
            <p className="mt-2 text-sm text-[#666]">Baseado em {formatNumber(product.reviews)} avaliações</p>

            <div className="mt-6 space-y-3">
              {distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-10 font-semibold text-[#555]">{item.stars} estrelas</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ededed]">
                    <div className="h-full rounded-full bg-[#f80046]" style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="w-8 text-right text-[#777]">{item.percent}%</span>
                </div>
              ))}
            </div>

            <button className="mt-6 h-11 w-full rounded-full border-2 border-[#f80046] text-sm font-black text-[#f80046] transition hover:bg-[#fff1f3]" type="button">
              escrever avaliação
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {['todos', '5 estrelas', '4 estrelas', 'com fotos', 'mais recentes'].map((filter) => (
                <button key={filter} className="rounded-full border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#555] transition hover:border-[#f80046] hover:text-[#f80046]" type="button">
                  {filter}
                </button>
              ))}
            </div>

            <div className="rounded-[22px] border border-[#ededed] bg-white p-5 shadow-[0_4px_14px_rgb(0_0_0/0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#212121]">Avaliação média do produto</h3>
                  <p className="mt-1 text-xs text-[#777]">{product.brand} · {product.title}</p>
                </div>
                <Stars rating={product.rating} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#444]">
                Clientes avaliaram este produto com nota {product.rating.toFixed(1)} de 5, considerando qualidade, preço e experiência de compra.
              </p>
              <button className="mt-4 text-sm font-semibold text-[#666] transition hover:text-[#f80046]" type="button">
                útil · {formatNumber(product.reviews)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RelatedProducts({ relatedProducts, onProductClick }: { relatedProducts: RelatedProduct[]; onProductClick: (id: number) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = () => {
    const element = scrollerRef.current;
    if (!element) return;
    const scrollLeft = Math.round(element.scrollLeft);
    const maxScroll = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    updateButtons();
    window.addEventListener('resize', updateButtons);
    return () => window.removeEventListener('resize', updateButtons);
  }, []);

  const scroll = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });
    window.requestAnimationFrame(updateButtons);
  };

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">relacionados</p>
            <h2 className="mt-1 text-2xl font-black text-[#212121]">Produtos parecidos</h2>
          </div>
          <div className="flex items-center gap-2">
            {canScrollLeft && (
              <button className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd] bg-white text-[#212121]" type="button" onClick={() => scroll(-1)} aria-label="Produtos anteriores">
                <ChevronLeft size={22} />
              </button>
            )}
            {canScrollRight && (
              <button className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd] bg-white text-[#212121]" type="button" onClick={() => scroll(1)} aria-label="Próximos produtos">
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <div ref={scrollerRef} onScroll={updateButtons} className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {relatedProducts.map((item) => (
              <a
                key={item.id}
                href={getProductPath(item)}
                onClick={(event) => {
                  event.preventDefault();
                  onProductClick(item.id);
                }}
                className="group min-h-[330px] w-[220px] shrink-0 overflow-hidden rounded-[22px] border border-[#ededed] bg-white p-4 shadow-[0_4px_14px_rgb(0_0_0/0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_28px_rgb(0_0_0/0.08)]"
              >
                <div className="relative grid h-[180px] place-items-center rounded-[18px] bg-[#fafafa]">
                  <img className="max-h-[132px] max-w-[140px] object-contain transition-transform duration-200 group-hover:scale-105" src={item.image} alt={item.title} loading="lazy" />
                  <button className="absolute bottom-3 right-3 grid h-[44px] w-[44px] place-items-center rounded-full bg-[#f80046] text-white shadow-[0_6px_16px_rgb(248_0_70/0.35)]" type="button" aria-label={`Adicionar ${item.title} ao carrinho`}>
                    <ShoppingBag size={18} />
                  </button>
                </div>
                <h3 className="mt-4 overflow-hidden text-sm font-semibold leading-5 text-[#212121] line-clamp-2">{item.title}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#666]">
                  <Stars rating={item.rating} size={13} />
                  <strong className="text-[#333]">{item.rating.toFixed(1)}</strong>
                  <span>({item.reviews})</span>
                </div>
                {item.oldPrice > item.price && <p className="mt-2 text-xs text-[#999] line-through">{formatCurrency(item.oldPrice)}</p>}
                <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#f80046]">{formatCurrency(item.price)}</p>
                <p className="mt-1 text-xs text-[#666]">{item.installments}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const navigate = useNavigate();
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const { products } = useStoredProducts();
  const productId = Number(slug?.split('-').pop());
  const product = products.find((item) => item.id === productId || item.slug === slug);
  const relatedProducts = products.filter((item) => item.id !== productId).slice(0, 8);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-[#212121]">
        {offerModalOpen && <InitialOfferModal onClose={() => setOfferModalOpen(false)} />}
        {regionModalOpen && <RegionModal onClose={() => setRegionModalOpen(false)} />}

        <div className="max-md:hidden">
          <Header />
        </div>
        <div className="md:hidden">
          <MobileHeader />
        </div>

        <main className="mx-auto grid min-h-[60vh] max-w-[1440px] place-items-center px-4 py-16 lg:px-6">
          <div className="rounded-[24px] border border-[#ededed] bg-[#fafafa] p-8 text-center shadow-[0_8px_28px_rgb(0_0_0/0.06)]">
            <h1 className="text-2xl font-black text-[#212121]">Produto não encontrado</h1>
            <p className="mt-3 text-sm leading-6 text-[#666]">Não encontramos um produto com o identificador informado.</p>
            <button className="mt-6 h-12 rounded-full bg-[#f80046] px-6 text-sm font-black text-white transition hover:bg-[#d90033]" type="button" onClick={() => navigate('/')}>
              voltar para a home
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      {offerModalOpen && <InitialOfferModal onClose={() => setOfferModalOpen(false)} />}
      {regionModalOpen && <RegionModal onClose={() => setRegionModalOpen(false)} />}

      <div className="max-md:hidden">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader />
      </div>

      <Breadcrumb product={product} />

      <main>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-5 lg:grid-cols-[40%_35%_25%] lg:px-6">
          <div className="min-w-0">
            <ProductGallery product={product} />
          </div>
          <div className="min-w-0">
            <ProductInfo product={product} />
          </div>
          <div className="lg:sticky lg:top-[104px] lg:self-start">
            <BuyBox product={product} />
          </div>
        </section>

        <BenefitsSection />

        <section className="mx-auto max-w-[1440px] px-4 py-5 lg:px-6">
          <div className="rounded-[24px] border border-[#ededed] bg-[#fff1f3] p-5 md:p-7">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#f80046]">condições especiais</p>
            <h2 className="mt-1 text-2xl font-black text-[#212121]">Aproveite no Cliente A</h2>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#444]">
              Condições exclusivas, cashback e ofertas selecionadas para você pagar menos no {product.title} e em outros produtos da Americanas.
            </p>
          </div>
        </section>

        <HighlightsSection specifications={product.specifications} />
        <DescriptionSection product={product} />
        <Specifications specifications={product.specifications} />
        <ReviewsSection product={product} />
        <RelatedProducts relatedProducts={relatedProducts} onProductClick={(relatedId) => {
          const relatedProduct = products.find((item) => item.id === relatedId);

          if (relatedProduct) {
            navigate(getProductPath(relatedProduct));
          }
        }} />
      </main>

      <Footer />
    </div>
  );
}

export default ProductPage;
