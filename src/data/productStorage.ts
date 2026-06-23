import { Product, products as catalogProducts } from './products';
import { productSections, type Product as MockProduct } from './mockData';

const PRODUCTS_STORAGE_KEY = 'americanas-products';
const PRODUCTS_UPDATED_EVENT = 'americanas-products-updated';
const MOCK_PRODUCT_ID_START = 1000;

const mockProducts: Product[] = productSections.flatMap((section, sectionIndex) =>
  section.products.map((product, productIndex) => normalizeMockProduct(product, sectionIndex, productIndex)),
);

const baseProducts: Product[] = [...catalogProducts, ...mockProducts];

function normalizeMockProduct(product: MockProduct, sectionIndex: number, productIndex: number): Product {
  const id = MOCK_PRODUCT_ID_START + sectionIndex * 100 + productIndex + 1;

  return {
    id,
    title: product.name,
    slug: product.name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${id}`,
    image: product.image,
    images: [product.image],
    price: product.price,
    oldPrice: product.oldPrice,
    rating: product.rating,
    reviews: product.reviews,
    installments: product.installments,
    brand: product.name.split(' ')[0],
    description: product.name,
    specifications: {
      Origem: 'Catálogo mockado',
    },
  };
}

export function getBaseProducts() {
  return baseProducts;
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const product = value as Partial<Product>;

  return (
    typeof product.id === 'number' &&
    typeof product.title === 'string' &&
    (typeof product.slug === 'string' || product.slug === undefined) &&
    typeof product.image === 'string' &&
    Array.isArray(product.images) &&
    typeof product.price === 'number' &&
    typeof product.oldPrice === 'number' &&
    typeof product.rating === 'number' &&
    typeof product.reviews === 'number' &&
    typeof product.installments === 'string' &&
    typeof product.brand === 'string' &&
    typeof product.description === 'string' &&
    typeof product.specifications === 'object' &&
    product.specifications !== null
  );
}

function mergeSavedProducts(savedProducts: Product[]) {
  const mergedProducts = new Map(baseProducts.map((product) => [product.id, product]));

  savedProducts.forEach((product) => {
    mergedProducts.set(product.id, product);
  });

  return Array.from(mergedProducts.values());
}

export function getStoredProducts(): Product[] {
  try {
    const savedProducts = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);

    if (!savedProducts) {
      return baseProducts;
    }

    const parsedProducts: unknown = JSON.parse(savedProducts);

    if (!Array.isArray(parsedProducts) || !parsedProducts.every(isProduct)) {
      return baseProducts;
    }

    return mergeSavedProducts(parsedProducts);
  } catch {
    return baseProducts;
  }
}

export function saveProducts(nextProducts: Product[]) {
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(nextProducts));
  window.dispatchEvent(new CustomEvent<Product[]>(PRODUCTS_UPDATED_EVENT, { detail: nextProducts }));
}

export function listenForProductUpdates(callback: (nextProducts: Product[]) => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== PRODUCTS_STORAGE_KEY || !event.newValue) {
      return;
    }

    const parsedProducts = JSON.parse(event.newValue);

    if (Array.isArray(parsedProducts) && parsedProducts.every(isProduct)) {
      callback(parsedProducts);
    }
  };

  const handleCustomEvent = (event: Event) => {
    callback((event as CustomEvent<Product[]>).detail);
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(PRODUCTS_UPDATED_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleCustomEvent);
  };
}
