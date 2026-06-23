import { Gift, Heart, MapPin, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '../CartDrawer';
import { useCart } from '../../context/CartContext';
import { CepModal } from '../CepModal/CepModal';
import { MobileMenu } from '../MobileMenu/MobileMenu';

export function MobileHeader() {
  const { cartOpen, openCart, closeCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cepModalOpen, setCepModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[70] bg-[#f80046] text-white">
      <div className="mx-auto flex h-[54px] w-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button className="grid h-[34px] w-[34px] place-items-center rounded-md bg-transparent p-0 text-white" type="button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} strokeWidth={2.4} />
          </button>

          <a className="text-[24px] font-black leading-none tracking-[-0.06em] underline underline-offset-4" href="/" aria-label="Americanas home">
            americanas
          </a>
        </div>

        <div className="flex items-center gap-[9px]">
          <a className="grid h-[28px] w-[28px] place-items-center text-white" href="/login" aria-label="Login">
            <User size={22} strokeWidth={2.2} />
          </a>

          <a className="grid h-[28px] w-[28px] place-items-center text-white" href="#" aria-label="Presentes">
            <Gift size={22} strokeWidth={2.2} />
          </a>

          <a className="grid h-[28px] w-[28px] place-items-center text-white" href="#" aria-label="Favoritos">
            <Heart size={22} strokeWidth={2.2} />
          </a>

          <button className="relative grid h-[28px] w-[28px] place-items-center text-white" type="button" aria-label="Carrinho" onClick={openCart}>
            <ShoppingCart size={22} strokeWidth={2.2} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-[15px] w-[15px] place-items-center rounded-full bg-[#b20031] px-0 text-[9px] font-black leading-none text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto w-full px-4">
        <form className="mb-3 flex h-[48px] items-center rounded-[12px] bg-white px-4 text-[#9ca3af]" role="search">
          <input className="min-w-0 flex-1 border-0 bg-white p-0 text-[15px] font-medium text-[#9ca3af] outline-none placeholder:text-[#9ca3af]" type="search" placeholder="busque aqui seu produto" aria-label="Buscar produtos" />
          <button className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-md bg-white p-0 text-[#f80046]" type="submit" aria-label="Buscar">
            <Search size={22} strokeWidth={2.4} />
          </button>
        </form>

        <button className="mb-4 flex items-center gap-2 border-0 bg-transparent p-0 text-[14px] font-semibold text-white" type="button" onClick={() => setCepModalOpen(true)}>
          <MapPin size={17} strokeWidth={2.4} />
          informe seu CEP
        </button>
      </div>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <CepModal open={cepModalOpen} onClose={() => setCepModalOpen(false)} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </header>
  );
}
