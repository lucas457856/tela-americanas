import { type Product } from '../data/products';

export function getProductSlug(product: Pick<Product, 'title' | 'id'>) {
  return (
    product.title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${product.id}`
  );
}

export function getProductPath(product: Pick<Product, 'title' | 'id'>) {
  return `/${getProductSlug(product)}`;
}
