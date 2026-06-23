import { ChevronRight, Flame, UsersRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { departments, mobileDepartmentItems } from '../../data/mockData';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const featuredDepartments = [
  'mercado',
  'climatização',
  'celulares',
  'eletrodomésticos',
  'informática',
  'áudio e vídeo',
  'eletroportáteis',
  'móveis',
  'central do torcedor',
];

const categoryIcons: Record<string, React.ReactElement> = {
  mercado: <Flame size={18} color="#fff" />,
  climatização: <Flame size={18} color="#fff" />,
  celulares: <UsersRound size={18} color="#fff" />,
  eletrodomésticos: <Flame size={18} color="#fff" />,
  informática: <UsersRound size={18} color="#fff" />,
  'áudio e vídeo': <UsersRound size={18} color="#fff" />,
  eletroportáteis: <Flame size={18} color="#fff" />,
  móveis: <UsersRound size={18} color="#fff" />,
  'central do torcedor': <Flame size={18} color="#fff" />,
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const selectedItems = useMemo(() => (selectedDepartment ? mobileDepartmentItems[selectedDepartment] ?? [] : []), [selectedDepartment]);

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

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.open : ''}`} onClick={onClose} />

      <aside className={`${styles.drawer} ${open ? styles.open : ''}`} aria-label="Menu mobile" aria-hidden={!open}>
        <header className={styles.menuHeader}>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar menu">
            <X size={24} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.body}>
          {!selectedDepartment ? (
            <>
              <section className={styles.section}>
                <button className={styles.sectionButton} type="button" aria-label="Todos os departamentos">
                  <span>todos os departamentos</span>
                  <ChevronRight size={18} />
                </button>
              </section>

              <section className={styles.section}>
                <h2>departamentos em destaque</h2>
                <ul>
                  {featuredDepartments.map((department) => (
                    <li key={department}>
                      <button className={styles.departmentButton} type="button" onClick={() => setSelectedDepartment(department)}>
                        <span>{department}</span>
                        <ChevronRight size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.section}>
                <h2>todos os departamentos</h2>
                <ul>
                  {departments.slice(1).map((department) => (
                    <li key={department}>
                      <button className={styles.departmentButton} type="button" onClick={() => setSelectedDepartment(department)}>
                        <span className={styles.iconBox}>{categoryIcons[department]}</span>
                        <span>{department}</span>
                        <ChevronRight size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className={styles.categorySection}>
              <button className={styles.backButton} type="button" onClick={() => setSelectedDepartment(null)}>
                <ChevronRight size={18} />
                <span>todos os departamentos</span>
              </button>
              <h2>{selectedDepartment}</h2>
              <ul>
                {selectedItems.map((item) => (
                  <li key={item}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
