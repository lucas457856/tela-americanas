import { CreditCard, Heart, MapPin, Menu, ShoppingCart, Store, User } from 'lucide-react';
import CartDrawer from '../CartDrawer';
import { useCart } from '../../context/CartContext';
import { SearchBar } from '../SearchBar/SearchBar';
import styles from './Header.module.css';

const secondaryLinks = [
  'baixe o app',
  'peça seu cartão',
  'cliente a',
  'mais vendidos',
  'nossas lojas',
  'entrega rápida',
  'leve+ pague-',
  'ofertas da TV',
  'oferta do dia',
];

export function Header() {
  const { cartOpen, openCart, closeCart, totalItems } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.topStrip}>
        <div className={styles.topStripInner}>
          <strong>cartão cliente · a</strong>
          <span>parcele em até 12x sem juros</span>
          <strong>benefícios exclusivos</strong>
          <a href="#">peça agora</a>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <button className={styles.mobileMenuButton} type="button" aria-label="Abrir menu">
            <Menu size={22} />
          </button>

          <a className={styles.logo} href="/" aria-label="Americanas home">
            americanas
          </a>

          <SearchBar />

          <div className={styles.rightActions}>
            <a className={styles.login} href="/login" aria-label="Olá, faça seu login ou cadastre-se">
              <span className={styles.loginIcon}>
                <User size={20} />
              </span>
              <span>
                olá, faça seu login
                <strong>ou cadastre-se</strong>
              </span>
            </a>

            <a className={styles.iconButton} href="/lojas" aria-label="Nossas lojas">
              <Store size={22} />
            </a>
            <a className={styles.iconButton} href="/favoritos" aria-label="Favoritos">
              <Heart size={22} />
            </a>
            <button className={styles.cartButton} type="button" aria-label="Carrinho" onClick={openCart}>
              <ShoppingCart size={22} />
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.secondaryMenu}>
        <div className={styles.container}>
          <a className={styles.cepLink} href="#">
            <MapPin size={15} />
            informe seu CEP
          </a>

          <nav className={styles.secondaryLinks} aria-label="Links secundários">
            {secondaryLinks.map((link) => (
              <a key={link} href="#">
                {link}
              </a>
            ))}
          </nav>

          <a className={styles.cardMini} href="#">
            <CreditCard size={14} />
            peça seu cartão
          </a>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={closeCart} />
    </header>
  );
}
