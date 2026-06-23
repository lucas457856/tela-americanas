import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export function SearchBar() {
  return (
    <form className={styles.search} role="search">
      <Search className={styles.icon} size={18} />
      <input type="search" placeholder="busque aqui seu produto" aria-label="Buscar produtos" />
      <button type="submit" aria-label="Buscar">
        <Search size={18} />
      </button>
    </form>
  );
}
