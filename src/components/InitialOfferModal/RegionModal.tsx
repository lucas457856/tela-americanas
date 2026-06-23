import { MapPin, X } from 'lucide-react';
import styles from './InitialOfferModal.module.css';

interface RegionModalProps {
  onClose: () => void;
}

export function RegionModal({ onClose }: RegionModalProps) {
  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Informe seu CEP">
      <div className={styles.regionModal}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar modal">
          <X size={22} strokeWidth={2.2} />
        </button>

        <div className={styles.regionIcon}>
          <MapPin size={26} />
        </div>

        <h2>as melhores ofertas e condições de frete para a sua região :)</h2>

        <p>Com seu CEP, mostramos ofertas da sua região e calculamos o frete com mais precisão.</p>

        <div className={styles.regionActions}>
          <input type="text" inputMode="numeric" placeholder="Digite o seu CEP" aria-label="Digite o seu CEP" />
          <button type="button">OK</button>
        </div>

        <a href="#">
          não sei meu cep
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
