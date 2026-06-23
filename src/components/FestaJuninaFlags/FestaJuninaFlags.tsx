import styles from './FestaJuninaFlags.module.css';

const flags = Array.from({ length: 64 }, (_, index) => index);

export function FestaJuninaFlags() {
  return (
    <div className={styles.flags} aria-hidden="true">
      <div className={styles.string} />
      <div className={styles.flagRow}>
        {flags.map((index) => (
          <span key={index} className={index % 2 === 0 ? styles.green : styles.yellow}>
            a
          </span>
        ))}
      </div>
    </div>
  );
}
