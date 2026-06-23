import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { heroSlides } from '../../data/mockData';
import styles from './HeroBanner.module.css';

export function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => setActive((index + heroSlides.length) % heroSlides.length);

  return (
    <section className={styles.hero} aria-label="Banners promocionais">
      <div className={styles.container}>
        <div className={styles.viewport}>
          {heroSlides.map((slide, index) => (
            <article
              key={slide.id}
              className={`${styles.slide} ${index === active ? styles.active : ''}`}
              style={{ '--accent': slide.accent, '--secondary': slide.secondary } as React.CSSProperties}
              aria-hidden={index !== active}
            >
              <div className={styles.copy}>
                <div className={styles.kicker}>
                  <strong>{slide.kicker}</strong>
                  <span>{slide.brand}</span>
                  <small>
                    {slide.tagline.replace('gool', '')}
                    <strong>gool</strong>
                  </small>
                </div>

                <div className={styles.offer}>
                  <em>{slide.offerTop}</em>
                  <strong>{slide.offer}</strong>
                  <span>{slide.offerBottom}</span>
                </div>

                <a href="#">{slide.cta}</a>
              </div>

              <div className={styles.visual} aria-hidden="true">
                <div className={styles.visualPanel}>
                  <div className={styles.productStack}>
                    <span>FIFA</span>
                    <strong>Doritos</strong>
                    <small>Fanta</small>
                    <b>75g</b>
                  </div>

                  <div className={styles.tvFrame}>
                    <div className={styles.screen} />
                    <span className={styles.screenSize}>{slide.tag}</span>
                    <div className={styles.tvBase} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className={`${styles.arrow} ${styles.prev}`} type="button" onClick={() => goTo(active - 1)} aria-label="Banner anterior">
          <ChevronLeft size={28} />
        </button>
        <button className={`${styles.arrow} ${styles.next}`} type="button" onClick={() => goTo(active + 1)} aria-label="Próximo banner">
          <ChevronRight size={28} />
        </button>

        <div className={styles.dots} role="tablist" aria-label="Selecionar banner">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === active ? styles.activeDot : undefined}
              onClick={() => goTo(index)}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
