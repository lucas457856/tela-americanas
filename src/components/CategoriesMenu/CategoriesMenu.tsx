import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';
import { departments } from '../../data/mockData';
import styles from './CategoriesMenu.module.css';

export function CategoriesMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button className={styles.allDepartments} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <Menu size={18} />
          <span>{departments[0]}</span>
          <ChevronDown size={15} className={open ? styles.openIcon : undefined} />
        </button>

        <nav className={styles.inlineDepartments} aria-label="Departamentos">
          {departments.slice(1).map((department) => (
            <a key={department} href="#">
              {department}
            </a>
          ))}
        </nav>
      </div>

      {open && (
        <aside className={styles.drawer} aria-label="Departamentos">
          <div className={styles.drawerHeader}>
            <strong>Departamentos</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar departamentos">
              ✕
            </button>
          </div>
          <ul>
            {departments.map((department) => (
              <li key={department}>
                <a href="#">
                  <span>{department}</span>
                  <ChevronRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
