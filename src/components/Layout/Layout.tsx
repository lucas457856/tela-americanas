import { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <main className={styles.layout}>{children}</main>;
}
