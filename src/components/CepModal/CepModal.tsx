import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import styles from './CepModal.module.css';

interface CepModalProps {
  open: boolean;
  onClose: () => void;
}

export function CepModal({ open, onClose }: CepModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Informe seu CEP" onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar modal">
          <X size={22} strokeWidth={2.2} />
        </button>

        <h2>As melhores ofertas e condições de frete para a sua região :)</h2>

        <p>Com seu CEP, mostramos ofertas da sua região e calculamos o frete com mais precisão.</p>

        <div className={styles.cepActions}>
          <input type="text" inputMode="numeric" placeholder="Digite o seu CEP" aria-label="Digite o seu CEP" onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => event.stopPropagation()}>OK</button>
        </div>

        <a href="#" onClick={(event) => event.stopPropagation()}>
          não sei meu cep
          <ExternalLink size={12} />
        </a>
      </section>
    </div>
  );
}
