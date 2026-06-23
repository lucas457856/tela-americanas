import { shortcuts } from '../../data/mockData';
import styles from './PromoIcons.module.css';

export function PromoIcons() {
  return (
    <section className={styles.promo} aria-label="Atalhos promocionais">
      <div className={styles.container}>
        {shortcuts.map((item) => (
          <a key={item.label} href="#">
            <strong>{item.label}</strong>
            {item.sublabel && <small>{item.sublabel}</small>}
          </a>
        ))}
      </div>
    </section>
  );
}
