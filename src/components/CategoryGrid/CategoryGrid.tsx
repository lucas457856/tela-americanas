import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './CategoryGrid.module.css';

type Category = {
  id: string;
  label: string;
  icon: ReactNode;
};

const red = '#ff003c';

const bearIcon = (
  <svg viewBox="0 0 64 64" width="48" height="48" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="8" fill={red} />
    <circle cx="44" cy="20" r="8" fill={red} />
    <circle cx="32" cy="34" r="22" fill={red} />
    <circle cx="24" cy="31" r="3" fill="#fff" />
    <circle cx="40" cy="31" r="3" fill="#fff" />
    <path d="M32 37c-3 3-6 3-8 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M24 42h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const phoneIcon = (
  <svg viewBox="0 0 64 64" width="48" height="48" fill="none" aria-hidden="true">
    <rect x="21" y="8" width="22" height="48" rx="5" fill={red} />
    <path d="M29 49h6M25 16h14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    <path d="M33 17v30" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <path d="M42 14 24 52" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
  </svg>
);

const chocolateIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <path d="M18 18c8-8 20-8 28 0s8 20 0 28-20 8-28 0-8-20 0-28Z" fill={red} />
    <path d="M43 18c8 8 8 20 0 28" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
    <path d="M18 43c8 8 20 8 28 0" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
    <circle cx="44" cy="18" r="5" fill="#6b0015" />
  </svg>
);

const cookieIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <rect x="12" y="14" width="24" height="20" rx="4" fill={red} />
    <path d="M18 22h4M26 22h4M22 28h4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <rect x="30" y="30" width="22" height="18" rx="4" fill="#9f0024" />
    <path d="M35 38h5M43 38h4" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const sofaIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <rect x="12" y="22" width="40" height="20" rx="5" fill={red} />
    <rect x="16" y="14" width="12" height="12" rx="3" fill={red} />
    <rect x="36" y="14" width="12" height="12" rx="3" fill={red} />
    <path d="M17 42v9M47 42v9" stroke={red} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const airFryerIcon = (
  <svg viewBox="0 0 64 64" width="50" height="50" fill="none" aria-hidden="true">
    <path d="M18 22h28a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10H18a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10Z" fill={red} />
    <rect x="27" y="10" width="14" height="12" rx="3" fill={red} />
    <circle cx="34" cy="37" r="5" fill="#fff" />
    <path d="M34 33v8M30 37h8" stroke="#111" strokeWidth="3" strokeLinecap="round" />
    <circle cx="31" cy="16" r="1.5" fill="#fff" />
    <circle cx="37" cy="16" r="1.5" fill="#fff" />
  </svg>
);

const diaperIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <path d="M18 14h28l-5 36H23L18 14Z" fill={red} />
    <path d="M18 14c-6 2-9 5-10 10 5 2 9 1 13-3M46 14c6 2 9 5 10 10-5 2-9 1-13-3" stroke={red} strokeWidth="5" strokeLinecap="round" />
    <path d="M24 22h16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const hairDryerIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <path d="M14 24h28a10 10 0 0 1 0 20H14a10 10 0 0 1 0-20Z" fill={red} />
    <path d="M34 40 48 54" stroke={red} strokeWidth="10" strokeLinecap="round" />
    <path d="M10 24h8M10 34h8M10 44h8" stroke={red} strokeWidth="4" strokeLinecap="round" />
    <circle cx="22" cy="34" r="3" fill="#fff" />
  </svg>
);

const fridgeIcon = (
  <svg viewBox="0 0 64 64" width="42" height="54" fill="none" aria-hidden="true">
    <rect x="16" y="7" width="32" height="50" rx="5" fill={red} />
    <path d="M16 27h32M30 14h.1M30 34h.1" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const cleaningIcon = (
  <svg viewBox="0 0 64 64" width="50" height="52" fill="none" aria-hidden="true">
    <path d="M20 18h18l-3 18H17l3-18Z" fill="#9f0024" />
    <path d="M17 36h28v15H17z" fill={red} />
    <path d="M42 12v12h-6" stroke={red} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M39 31 51 55" stroke={red} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const tvIcon = (
  <svg viewBox="0 0 64 64" width="52" height="42" fill="none" aria-hidden="true">
    <rect x="8" y="14" width="48" height="32" rx="4" fill={red} />
    <path d="M45 19 20 41" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    <path d="M20 46h24" stroke="#9f0024" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const kitchenwareIcon = (
  <svg viewBox="0 0 64 64" width="52" height="50" fill="none" aria-hidden="true">
    <path d="M14 24h34v18a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V24Z" fill={red} />
    <path d="M14 24h34" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    <path d="M24 16h18v8H24z" fill="#9f0024" />
    <path d="M43 35h9v13H43z" fill={red} />
    <path d="M43 48h13" stroke={red} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const bedIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <path d="M12 22h40v30H12z" fill="#9f0024" />
    <rect x="17" y="14" width="17" height="18" rx="3" fill={red} />
    <rect x="34" y="14" width="17" height="18" rx="3" fill={red} />
    <path d="M12 36h40" stroke={red} strokeWidth="6" strokeLinecap="round" />
    <path d="M16 52v-8M48 52v-8" stroke="#9f0024" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const notebookIcon = (
  <svg viewBox="0 0 64 64" width="52" height="48" fill="none" aria-hidden="true">
    <rect x="10" y="12" width="38" height="28" rx="3" fill={red} />
    <path d="M38 16 20 36" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    <rect x="18" y="40" width="34" height="6" rx="2" fill="#9f0024" />
    <rect x="24" y="20" width="12" height="20" rx="3" fill="#9f0024" />
    <path d="M39 27h.1M39 34h.1" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const fanIcon = (
  <svg viewBox="0 0 64 64" width="52" height="52" fill="none" aria-hidden="true">
    <path d="M23 32c-9-1-15-7-15-15 8 0 14 6 15 15Z" fill={red} />
    <path d="M41 32c9-1 15-7 15-15-8 0-14 6-15 15Z" fill={red} />
    <path d="M32 32c-1-9-7-15-15-15 0 8 6 14 15 15Z" fill={red} transform="rotate(180 32 32)" />
    <circle cx="32" cy="32" r="5" fill="#3b000d" />
    <path d="M32 37v15M24 52h16" stroke={red} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const categories: Category[] = [
  { id: 'brinquedos', label: 'brinquedos', icon: bearIcon },
  { id: 'telefonia', label: 'telefonia', icon: phoneIcon },
  { id: 'chocolate', label: 'chocolate', icon: chocolateIcon },
  { id: 'biscoitos', label: 'biscoitos', icon: cookieIcon },
  { id: 'moveis', label: 'móveis', icon: sofaIcon },
  { id: 'eletroportateis', label: 'eletroportáteis', icon: airFryerIcon },
  { id: 'fraldas', label: 'fraldas', icon: diaperIcon },
  { id: 'beleza-perfumaria', label: 'beleza e perfumaria', icon: hairDryerIcon },
  { id: 'eletrodomesticos', label: 'eletrodomésticos', icon: fridgeIcon },
  { id: 'limpeza', label: 'limpeza', icon: cleaningIcon },
  { id: 'tvs', label: 'TVs', icon: tvIcon },
  { id: 'utilidades-domesticas', label: 'utilidades domésticas', icon: kitchenwareIcon },
  { id: 'cama-mesa-banho', label: 'cama, mesa e banho', icon: bedIcon },
  { id: 'notebooks', label: 'notebooks', icon: notebookIcon },
  { id: 'climatizacao', label: 'climatização', icon: fanIcon },
];

export function CategoryGrid() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const updateButtons = () => {
      const scrollLeft = Math.round(container.scrollLeft);
      const maxScroll = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    };

    updateButtons();

    const handleScroll = () => {
      window.requestAnimationFrame(updateButtons);
    };

    const handleResize = () => {
      window.requestAnimationFrame(updateButtons);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollCategories = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({
      left: direction * 450,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>navegue por categoria :)</h2>
        </div>

        <div className={styles.carousel} ref={carouselRef} aria-label="Categorias">
          {canScrollLeft && (
            <button className={styles.prevButton} type="button" aria-label="Categorias anteriores" onClick={() => scrollCategories(-1)}>
              <ChevronLeft size={30} />
            </button>
          )}

          <div className={styles.track}>
            {categories.map((category) => (
              <a key={category.id} className={styles.category} href="#" aria-label={category.label}>
                <span className={styles.icon}>{category.icon}</span>
                <strong>{category.label}</strong>
              </a>
            ))}
          </div>

          {canScrollRight && (
            <button className={styles.nextButton} type="button" aria-label="Próximas categorias" onClick={() => scrollCategories(1)}>
              <ChevronRight size={30} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
