import { ShoppingBasket, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
    total,
  } = useCart();

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[190]">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/45"
        aria-label="Fechar cesta"
        onClick={onClose}
      />

      <aside
        className="fixed right-0 top-0 z-[200] flex h-[100vh] w-[390px] max-w-[100vw] flex-col bg-white shadow-[0_8px_40px_rgb(0_0_0/0.28)] transition-transform duration-300 ease-in-out max-md:w-[100vw]"
        role="dialog"
        aria-modal="true"
        aria-label="Minha cesta"
      >
        <header className="flex h-[64px] shrink-0 items-center justify-between bg-[#ff0054] px-5 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBasket size={24} strokeWidth={2.2} />
            <h2 className="text-lg font-black tracking-[-0.03em]">minha cesta</h2>
          </div>

          <button
            type="button"
            className="grid h-[34px] w-[34px] place-items-center rounded-full text-white transition hover:bg-white/15"
            aria-label="Fechar drawer da cesta"
            onClick={onClose}
          >
            <X size={22} strokeWidth={2.4} />
          </button>
        </header>

        {items.length === 0 ? (
          <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-[#fff1f3] text-[#ff0054]">
              <ShoppingBasket size={46} strokeWidth={1.8} />
            </div>

            <h3 className="mt-6 text-2xl font-black tracking-[-0.045em] text-[#212121]">
              sua cesta tá vazia
            </h3>

            <p className="mx-auto mt-3 max-w-[260px] text-sm font-semibold leading-6 text-[#666]">
              que tal navegar pelas milhares de ofertas e achar uma especial para você?
            </p>

            <button
              type="button"
              className="mt-8 h-[48px] min-w-[180px] rounded-full bg-[#ff0054] px-6 text-sm font-black text-white shadow-[0_8px_18px_rgb(255_0_84/0.24)] transition hover:bg-[#d90047]"
              onClick={onClose}
            >
              ver produtos
            </button>
          </main>
        ) : (
          <>
            <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <article key={item.id} className="flex gap-3 rounded-[18px] border border-[#ededed] bg-white p-3 shadow-[0_4px_14px_rgb(0_0_0/0.05)]">
                    <div className="relative h-[96px] w-[96px] shrink-0 rounded-[14px] bg-[#fafafa] p-3">
                      <img className="h-full w-full object-contain" src={item.image} alt={item.title} loading="lazy" />

                      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2 py-1 shadow-[0_4px_12px_rgb(0_0_0/0.12)]">
                        <button
                          type="button"
                          className="grid h-6 w-6 place-items-center rounded-full bg-[#f2f2f2] text-sm font-black text-[#212121] transition hover:bg-[#e6e6e6]"
                          aria-label="Diminuir quantidade"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          −
                        </button>
                        <span className="min-w-[18px] text-center text-sm font-black text-[#212121]">{item.quantity}</span>
                        <button
                          type="button"
                          className="grid h-6 w-6 place-items-center rounded-full bg-[#f2f2f2] text-sm font-black text-[#212121] transition hover:bg-[#e6e6e6]"
                          aria-label="Aumentar quantidade"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#212121]">{item.title}</h3>
                        <button
                          type="button"
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[#999] transition hover:bg-[#f2f2f2] hover:text-[#ff0054]"
                          aria-label={`Remover ${item.title} da cesta`}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X size={16} strokeWidth={2.2} />
                        </button>
                      </div>

                      <p className="mt-2 text-xs font-semibold text-[#666]">quantidade: {item.quantity}</p>
                      <p className="mt-2 text-lg font-black tracking-[-0.04em] text-[#ff0054]">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </main>

            <footer className="shrink-0 border-t border-[#ededed] bg-white px-5 pb-5 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-[#666]">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="flex items-center justify-between text-[#666]">
                  <span>Total</span>
                  <strong className="text-[20px] font-black tracking-[-0.04em] text-[#212121]">{formatCurrency(total)}</strong>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-[44px] rounded-full border-2 border-[#ff0054] bg-white text-sm font-black text-[#ff0054] transition hover:bg-[#fff1f3]"
                  onClick={onClose}
                >
                  continuar comprando
                </button>
                <button
                  type="button"
                  className="h-[44px] rounded-full bg-[#ff0054] text-sm font-black text-white shadow-[0_8px_18px_rgb(255_0_84/0.24)] transition hover:bg-[#d90047]"
                  onClick={() => navigate('/checkout')}
                >
                  continuar
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
