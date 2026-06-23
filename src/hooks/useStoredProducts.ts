import { useEffect, useState } from 'react';
import { Product } from '../data/products';
import { getBaseProducts, getStoredProducts, listenForProductUpdates } from '../data/productStorage';

export function useStoredProducts() {
  const [storedProducts, setStoredProducts] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => listenForProductUpdates(setStoredProducts), []);

  return {
    products: storedProducts,
    baseProducts: getBaseProducts(),
    setProducts: setStoredProducts,
  };
}
