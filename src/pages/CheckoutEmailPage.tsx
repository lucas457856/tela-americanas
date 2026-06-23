import { ArrowLeft, Check, Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckoutFooter } from '../components/CheckoutFooter';

function CheckoutEmailHeader() {
  return (
    <header className="sticky top-0 z-50 h-[64px] bg-[#f80046] text-white">
      <div className="mx-auto flex h-full max-w-[1216px] items-center justify-between px-5 lg:px-6">
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
  );
}

export default function CheckoutEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('campo obrigatório.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError('digite um e-mail válido.');
      return;
    }

    setError('');
    navigate('/checkout/profile', {
      state: {
        email: trimmedEmail,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#212121]">
      <CheckoutEmailHeader />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[420px] flex-col px-5 py-10 sm:px-6">
        <button
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-normal text-[#f80046] underline underline-offset-4 transition hover:text-[#d90033]"
          type="button"
          onClick={() => navigate('/checkout')}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          voltar para a cesta
        </button>

        <section className="w-full rounded-[18px] border border-[#ededed] bg-white p-6 shadow-[0_2px_10px_rgb(0_0_0/0.03)] sm:p-8">
          <h1 className="text-center text-2xl font-normal tracking-[-0.04em] text-[#212121]">
            para finalizar a sua compra
          </h1>
          <p className="mt-2 text-center text-sm font-semibold text-[#666]">faça login em sua conta</p>

          <form className="mt-8" onSubmit={handleSubmit} noValidate>
            <label className="mb-2 block text-sm font-normal text-[#212121]" htmlFor="checkout-email">
              e-mail:
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={18} />
              <input
                id="checkout-email"
                className={`h-[48px] w-full rounded-lg border bg-white px-4 pl-10 text-sm font-semibold outline-none transition focus:border-[#f80046] focus:ring-2 focus:ring-[#f80046]/10 ${
                  error ? 'border-[#f80046]' : 'border-[#ddd]'
                }`}
                type="email"
                placeholder="digite seu e-mail"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError('');
                }}
                aria-invalid={Boolean(error)}
                aria-describedby="checkout-email-error"
              />
            </div>

            {error && (
              <p id="checkout-email-error" className="mt-2 text-xs font-semibold text-[#f80046]">
                campo obrigatório.
              </p>
            )}

            <button
              className="mt-5 h-[48px] w-full rounded-lg bg-[#ff0054] text-sm font-normal text-white shadow-[0_8px_18px_rgb(255_0_84/0.24)] transition hover:bg-[#d90033]"
              type="submit"
            >
              continuar
            </button>
          </form>

          <section className="mt-6 rounded-lg bg-[#f2f2f2] p-5">
            <h2 className="text-sm font-normal leading-5 text-[#212121]">
              usamos seu e-mail de forma 100% segura para:
            </h2>

            <ul className="mt-4 space-y-3 text-sm font-semibold text-[#555]">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-[#f80046]" size={15} strokeWidth={3} />
                <span>identificar seu perfil</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-[#f80046]" size={15} strokeWidth={3} />
                <span>notificar sobre o andamento do seu pedido</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-[#f80046]" size={15} strokeWidth={3} />
                <span>gerenciar seu histórico de compras</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-[#f80046]" size={15} strokeWidth={3} />
                <span>acelerar o preenchimento de suas informações</span>
              </li>
            </ul>
          </section>
        </section>
      </main>

      <CheckoutFooter />
    </div>
  );
}
