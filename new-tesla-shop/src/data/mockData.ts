export interface Product {
  id: string;
  subcategoryId: string;
  name: string;
  price: number; // Price in UAH
  image: string;
  description: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

const CAT_IMAGE = 'https://api.teslapartscenter.com.ua/static/images/tesla-parts/categories/b698aab7-3b01-4f67-a693-da3936a2e7ad.jpg';
const SUB_IMAGE = 'https://api.teslapartscenter.com.ua/static/images/tesla-parts/subcategories/44f2b4c0-2ead-4342-b5ef-1b28a488c660.jpg';
const PROD_IMAGE = 'https://api.teslapartscenter.com.ua/static/images/tesla-parts/products/c6811ef7-9f64-4f28-9cce-39730ad0d622.jpg';

export const categories: Category[] = [
  { id: 'model-s', name: 'Model S', image: CAT_IMAGE },
  { id: 'model-3', name: 'Model E', image: CAT_IMAGE },
  { id: 'model-x', name: 'Model X', image: CAT_IMAGE },
  { id: 'model-y', name: 'Model Y', image: CAT_IMAGE },
];

export const subcategories: Subcategory[] = [
  // Model S
  { id: 's-exterior', categoryId: 'model-s', name: 'Зовнішній вигляд', image: SUB_IMAGE },
  { id: 's-interior', categoryId: 'model-s', name: 'Інтер\'єр', image: SUB_IMAGE },
  { id: 's-parts', categoryId: 'model-s', name: 'Запчастини', image: SUB_IMAGE },
  // Model 3 (E)
  { id: '3-exterior', categoryId: 'model-3', name: 'Зовнішній вигляд', image: SUB_IMAGE },
  { id: '3-interior', categoryId: 'model-3', name: 'Інтер\'єр', image: SUB_IMAGE },
  // Model X
  { id: 'x-exterior', categoryId: 'model-x', name: 'Зовнішній вигляд', image: SUB_IMAGE },
  { id: 'x-interior', categoryId: 'model-x', name: 'Інтер\'єр', image: SUB_IMAGE },
  // Model Y
  { id: 'y-exterior', categoryId: 'model-y', name: 'Зовнішній вигляд', image: SUB_IMAGE },
  { id: 'y-interior', categoryId: 'model-y', name: 'Інтер\'єр', image: SUB_IMAGE },
];

export const products: Product[] = [
  {
    id: 's-ext-1',
    subcategoryId: 's-exterior',
    name: 'Карбоновий спойлер',
    price: 15000,
    image: PROD_IMAGE,
    description: 'Легкий та міцний карбоновий спойлер для покращення аеродинаміки.',
  },
  {
    id: 's-int-1',
    subcategoryId: 's-interior',
    name: 'Всесезонні килимки',
    price: 4500,
    image: PROD_IMAGE,
    description: 'Комплект всесезонних килимків для захисту салону.',
  },
  {
    id: 's-parts-1',
    subcategoryId: 's-parts',
    name: 'Гальмівні колодки Performance',
    price: 8000,
    image: PROD_IMAGE,
    description: 'Високоефективні гальмівні колодки для впевненого гальмування.',
  },
  {
    id: '3-ext-1',
    subcategoryId: '3-exterior',
    name: 'Накладки на ручки (чорні)',
    price: 2000,
    image: PROD_IMAGE,
    description: 'Стильні чорні матові накладки на дверні ручки.',
  },
  {
    id: '3-ext-2',
    subcategoryId: '3-exterior',
    name: 'Бризковики комплект',
    price: 1800,
    image: PROD_IMAGE,
    description: 'Комплект з 4-х бризковиків для захисту кузова від бруду.',
  },
  {
    id: '3-int-1',
    subcategoryId: '3-interior',
    name: 'Органайзер центральної консолі',
    price: 1200,
    image: PROD_IMAGE,
    description: 'Зручний органайзер для зберігання дрібних речей.',
  },
  {
    id: 'x-ext-1',
    subcategoryId: 'x-exterior',
    name: 'Захисна плівка на пороги',
    price: 3500,
    image: PROD_IMAGE,
    description: 'Прозора захисна плівка для запобігання подряпинам.',
  },
  {
    id: 'y-int-1',
    subcategoryId: 'y-interior',
    name: 'Скляний дах - сонцезахисна шторка',
    price: 2500,
    image: PROD_IMAGE,
    description: 'Ефективний захист від сонця та перегріву салону.',
  },
];
