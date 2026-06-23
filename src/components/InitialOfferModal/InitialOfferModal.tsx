import { Clock, Flame, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './InitialOfferModal.module.css';

interface InitialOfferModalProps {
  onClose: () => void;
}

export function InitialOfferModal({ onClose }: InitialOfferModalProps) {
  const [seconds, setSeconds] = useState(22 * 60 * 60 + 10 * 60 + 3);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = (value: number) => String(value).padStart(2, '0');

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Oferta do dia">
      <div className={styles.modalContent}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar oferta">
          <X size={24} strokeWidth={2.2} />
        </button>

        <div className={styles.offerLabel}>
        <strong>oferta do dia</strong>
        <span>aproveite antes que acabe!</span>
      </div>

      <div className={styles.timer}>
        <Clock size={18} />
        <span>
          {formatTime(hours)} : {formatTime(minutes)} : {formatTime(remainingSeconds)}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.productName}>
            Red Bull 250ml
            <br />
            leve 2 por
          </div>

          <div className={styles.price}>
            <span>R$</span>
            <strong>7</strong>
            <em>99</em>
            <small>cada</small>
          </div>

          <button type="button">queeero</button>

          <p>
            <Flame size={12} />
            confira as regras
          </p>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.pickupBubble}>retire em 2h</div>
          <div className={`${styles.can} ${styles.canOne}`}>
            <span>monster</span>
            <strong>energy</strong>
            <small>zero</small>
          </div>
          <div className={`${styles.can} ${styles.canTwo}`}>
            <span>red</span>
            <strong>bull</strong>
            <small>250ml</small>
          </div>
          <div className={`${styles.can} ${styles.canThree}`}>
            <span>rink</span>
            <strong>energy</strong>
            <small>summit</small>
          </div>
        </div>
      </div>

        <div className={styles.footer}>
          <ShoppingBag size={18} />
          <span>retire em 2h</span>
        </div>
      </div>
    </div>
  );
}
