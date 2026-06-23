import { Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../data/products';
import { getProductPath } from '../../utils/productUrl';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  mobileHorizontal?: boolean;
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductCard({ product, mobileHorizontal }: ProductCardProps) {
  const navigate = useNavigate();
  const { items, addToCart, openCart, increaseQuantity, decreaseQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <article
      className={`${styles.card} ${mobileHorizontal ? styles.mobileHorizontalCard : ''} cursor-pointer`}
      onClick={() => navigate(getProductPath(product))}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(getProductPath(product));
        }
      }}
    >
      <div className={styles.imageLink}>
        <img src={product.image} alt={product.title} loading="lazy" />

        {quantity === 0 ? (
          <button
            className={styles.cartButton}
            type="button"
            aria-label={`Adicionar ${product.title} ao carrinho`}
            onClick={(event) => {
              event.stopPropagation();
              addToCart(product);
            }}
          >
            <ShoppingBag size={17} />
          </button>
        ) : (
          <div className={styles.quantitySelector}>
            <button
              type="button"
              className={styles.quantityButton}
              aria-label="Diminuir quantidade"
              onClick={(event) => {
                event.stopPropagation();
                decreaseQuantity(product.id);
              }}
            >
              <Minus size={14} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              className={styles.quantityButton}
              aria-label="Aumentar quantidade"
              onClick={(event) => {
                event.stopPropagation();
                increaseQuantity(product.id);
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <a
          className={styles.name}
          href={getProductPath(product)}
          onClick={(event) => {
            event.preventDefault();
            navigate(getProductPath(product));
          }}
        >
          {product.title}
        </a>

        <div className={styles.rating}>
          <Star size={13} fill="#ffb000" stroke="#ffb000" />
          <strong>{product.rating.toFixed(1)}</strong>
          <span>({product.reviews})</span>
        </div>

        {product.oldPrice > product.price && (
          <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
        )}

        <strong className={styles.price}>{formatPrice(product.price)}</strong>

        <span className={styles.installments}>{product.installments}</span>

        <br />

        {mobileHorizontal ? (
          <span className={styles.pickupBadge}>retire em 2h</span>
        ) : null}
      </div>
    </article>
  );
}
