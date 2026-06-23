import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react';
import { CheckoutFooter } from '../components/CheckoutFooter';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCEP(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function CheckoutHeader() {
  return (
    <header className="bg-[#f80046] text-white">
      <div className="mx-auto flex h-[72px] max-w-[1216px] items-center justify-between px-5 lg:px-6">
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
          <CheckCircle size={18} strokeWidth={2.4} />
          <span>ambiente 100% seguro</span>
        </div>
      </div>
    </header>
  );
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

function CheckoutTable() {
  const { items, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#ededed] bg-white shadow-[0_2px_10px_rgb(0_0_0/0.03)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[#f7f7f7] text-xs font-normal uppercase tracking-[0.03em] text-[#666]">
            <tr>
              <th className="px-4 py-4 font-normal">produto</th>
              <th className="px-4 py-4 font-normal">quantidade</th>
              <th className="px-4 py-4 font-normal">preço</th>
              <th className="px-4 py-4 font-normal">total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#ededed] align-top">
                <td className="px-4 py-5">
                  <div className="flex gap-4">
                    <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-[12px] bg-[#fafafa] p-3">
                      <img className="max-h-full max-w-full object-contain" src={item.image} alt={item.title} loading="lazy" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#212121]">{item.title}</h3>
                      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#0b7a3b]">
                        <Truck size={13} />
                        vendido e entregue por Americanas
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="font-semibold text-[#777]">cód. {item.id}</span>
                        <span className="font-semibold text-[#777]">produto novo</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-5 align-middle">
                  <QuantityControl
                    quantity={item.quantity}
                    onDecrease={() => decreaseQuantity(item.id)}
                    onIncrease={() => increaseQuantity(item.id)}
                  />
                </td>

                <td className="px-4 py-5 align-middle">
                  <div className="space-y-1">
                    {item.oldPrice > item.price && (
                      <p className="text-xs font-semibold text-[#999] line-through">{formatCurrency(item.oldPrice)}</p>
                    )}
                    <p className="text-sm font-normal text-normal">{formatCurrency(item.price)}</p>
                  </div>
                </td>

                <td className="px-4 py-5 align-middle">
                  <div className="flex flex-col items-start gap-3">
                    <strong className="text-sm font-normal text-[#212121]">{formatCurrency(item.price * item.quantity)}</strong>
                    <button
                      className="flex items-center gap-1 text-xs font-semibold text-[#999] transition hover:text-[#f80046]"
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remover ${item.title} da cesta`}
                    >
                      <X size={14} strokeWidth={2.2} />
                      remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DeliveryCard() {
  const { cep, setCep, address, shippingPrice, shippingCalculated, clearShipping, calculateShipping, isLoading } = useCheckout();
  const [error, setError] = useState('');

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextCep = event.target.value;
    setCep(nextCep);

    if (nextCep.replace(/\D/g, '').length !== 8) {
      clearShipping();
    }

    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const calculated = await calculateShipping();

    if (!calculated) {
      setError('CEP não encontrado.');
    }
  };

  return (
    <section className="rounded-[18px] border border-[#ededed] bg-white p-5 shadow-[0_2px_10px_rgb(0_0_0/0.03)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-normal tracking-[-0.03em] text-[#212121]">entrega</h2>

        <div className="inline-flex h-[42px] w-full max-w-[420px] rounded-lg border border-[#ededed] bg-[#fafafa] p-1">
          <button
            className="flex-1 rounded-md bg-[#f80046] px-4 text-sm font-normal text-white"
            type="button"
          >
            receber
          </button>
          <button
            className="flex-1 rounded-md px-4 text-sm font-normal text-[#f80046] transition hover:bg-[#fff1f3]"
            type="button"
          >
            retirar
          </button>
        </div>
      </div>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={17} />
          <input
            className="h-[44px] w-full rounded-lg border border-[#ddd] bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
            placeholder="Digite seu CEP"
            aria-label="Digite seu CEP"
            value={formatCEP(cep)}
            onChange={handleCepChange}
            inputMode="numeric"
          />
        </div>
        <button
          className="h-[44px] rounded-lg border-2 border-[#f80046] px-5 text-sm font-normal text-[#f80046] transition hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'calculando...' : 'calcular'}
        </button>
      </form>

      {isLoading && <p className="mt-3 text-sm font-semibold text-[#666]">Calculando entrega...</p>}
      {error && <p className="mt-3 text-sm font-semibold text-[#f80046]">{error}</p>}

      {shippingCalculated && address && (
        <div className="mt-4 rounded-lg border border-[#ededed] bg-[#fafafa] p-4">
          <p className="mb-3 text-sm font-semibold text-[#212121]">
            receber 1 item em <span className="underline">{formatCEP(address.cep)}</span>
          </p>

          <div className="flex items-center justify-between rounded-lg border border-[#ededed] bg-white px-4 py-3">
            <p className="text-sm font-semibold text-[#212121]">Em até 1 dia útil</p>
            <p className="text-sm font-normal text-[#212121]">{formatCurrency(shippingPrice)}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function CouponCard() {
  return (
    <section className="rounded-[14px] border border-[#ededed] bg-[#fafafa] p-4">
      <h3 className="text-sm font-normal text-[#212121]">cupom de desconto</h3>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#666]">Tem um cupom? Aplique aqui antes de continuar.</p>

      <div className="mt-4 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-[#ddd] bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10"
          placeholder="digite o cupom"
          aria-label="Digite o cupom"
        />
        <button className="rounded-lg bg-[#f80046] px-4 text-sm font-normal text-white transition hover:bg-[#d90033]" type="button">
          aplicar
        </button>
      </div>
    </section>
  );
}

function OrderSummary() {
  const navigate = useNavigate();
  const { subtotal } = useCart();
  const { shippingPrice, shippingCalculated } = useCheckout();
  const safeSubtotal = typeof subtotal === 'number' ? subtotal : 0;
  const safeShippingPrice = typeof shippingPrice === 'number' ? shippingPrice : 0;
  const total = safeSubtotal + safeShippingPrice;

  return (
    <section className="rounded-[18px] border border-[#ededed] bg-white p-5 shadow-[0_2px_10px_rgb(0_0_0/0.03)]">
      <h2 className="text-lg font-normal tracking-[-0.03em] text-[#212121]">resumo do pedido</h2>

      <CouponCard />

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-[#666]">
          <span className="font-semibold">subtotal</span>
          <strong className="font-normal text-[#212121]">{formatCurrency(safeSubtotal)}</strong>
        </div>

        <div className="flex items-center justify-between text-[#666]">
          <span className="font-semibold">entrega</span>
          <strong className="font-normal text-[#212121]">{shippingCalculated ? formatCurrency(safeShippingPrice) : 'não calculado'}</strong>
        </div>

        <div className="mt-4 border-t border-[#ededed] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-normal text-black">total</span>
            <strong className="text-2xl font-normal tracking-[-0.04em] text-black">{formatCurrency(total)}</strong>
          </div>
        </div>
      </div>

      <button
        className="mt-6 h-[56px] w-full rounded-full bg-[#f80046] text-base font-normal text-white shadow-[0_8px_18px_rgb(248_0_70/0.24)] transition hover:bg-[#d90033] disabled:cursor-not-allowed disabled:bg-[#ffb6c6]"
        type="button"
        disabled={total === 0 || !shippingCalculated}
        onClick={() => navigate('/checkout/email')}
      >
        continuar
      </button>

      <Link className="mt-4 block text-center text-sm font-normal text-[#f80046] underline underline-offset-4" to="/">
        adicionar mais produtos
      </Link>

      <p className="mt-5 text-xs font-semibold leading-5 text-[#777]">
        Ao continuar, você será direcionado para preencher seus dados de entrega e pagamento. O frete calculado será mantido no resumo do pedido.
      </p>
    </section>
  );
}

function EmptyCheckout() {
  return (
    <main className="mx-auto flex max-w-[1216px] flex-1 items-center justify-center px-5 py-16">
      <section className="w-full rounded-[22px] border border-[#ededed] bg-white p-10 text-center shadow-[0_8px_28px_rgb(0_0_0/0.06)]">
        <div className="mx-auto grid h-[96px] w-[96px] place-items-center rounded-full bg-[#fff1f3] text-[#f80046]">
          <ShoppingBag size={46} strokeWidth={1.8} />
        </div>

        <h1 className="mt-6 text-2xl font-normal tracking-[-0.04em] text-[#212121] sm:text-3xl">Seu carrinho está vazio</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-sm font-semibold leading-6 text-[#666]">
          Escolha produtos nas nossas ofertas e finalize sua compra com segurança.
        </p>

        <Link
          className="mt-8 inline-flex h-[52px] min-w-[180px] items-center justify-center rounded-full bg-[#f80046] px-7 text-sm font-normal text-white shadow-[0_8px_18px_rgb(248_0_70/0.24)] transition hover:bg-[#d90033]"
          to="/"
        >
          Escolher produtos
        </Link>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const safeSubtotal = typeof subtotal === 'number' ? subtotal : 0;

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#212121]">
      <CheckoutHeader />

      {items.length === 0 ? (
        <EmptyCheckout />
      ) : (
        <main className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="mb-6 lg:col-span-2">
            <h1 className="text-2xl font-normal tracking-[-0.04em] text-[#212121] sm:text-3xl">minha cesta</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#666]">
              {items.length} {items.length === 1 ? 'produto' : 'produtos'} • subtotal {formatCurrency(safeSubtotal)}
            </p>
          </div>

          <div className="min-w-0">
            <CheckoutTable />
            <br />
            <DeliveryCard />
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <OrderSummary />
          </aside>
        </main>
      )}
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <CheckoutFooter />
    </div>
  );
}
