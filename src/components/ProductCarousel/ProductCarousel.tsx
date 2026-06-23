import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Product } from '../../data/products';
import { ProductCard } from '../ProductCard/ProductCard';
import styles from './ProductCarousel.module.css';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  isMobileHorizontal?: boolean;
}

export function ProductCarousel({ title, products, isMobileHorizontal }: ProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const amount = Math.min(scroller.clientWidth * 0.82, 760);
    scroller.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{title}</h2>
          
        </div>

        <div className={styles.viewport}>
          {!isMobileHorizontal && (
            <button className={`${styles.arrow} ${styles.prev}`} type="button" onClick={() => scrollBy('left')} aria-label={`Rolar ${title} para a esquerda`}>
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            className={`${styles.scroller} ${isMobileHorizontal ? styles.productsCarousel : ''}`}
            ref={scrollerRef}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} mobileHorizontal={isMobileHorizontal} />
            ))}
          </div>

          {!isMobileHorizontal && (
            <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={() => scrollBy('right')} aria-label={`Rolar ${title} para a direita`}>
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
