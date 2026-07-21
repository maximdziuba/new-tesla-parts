export enum Currency {
  UAH = 'UAH',
  USD = 'USD'
}

export interface Subcategory {
  id: number;
  name: string;
  code?: string;
  image?: string;
  category_id?: number;
  parent_id?: number | null;
  sort_order?: number;
  subcategories?: Subcategory[];
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  sort_order?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  subcategories?: Subcategory[];
}

export interface Product {
  id: string;
  name: string;
  category: string; // Comma-separated list of categories (e.g., "Model 3, Model Y")
  subcategory_id?: number;
  subcategory_ids?: number[];
  priceUAH: number;
  priceUSD?: number;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  sort_order?: number;
  detail_number?: string;
  cross_number?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  is_favourite?: boolean;
}

export interface StaticSeoRecord {
  id: number;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface NovaPostBranch {
  id: string;
  description: string;
}

export interface City {
  id: string;
  name: string;
  branches: NovaPostBranch[];
}

export enum PaymentMethod {
  IBAN = 'Оплата на рахунок ФОП',
  COD = 'Накладений платіж' // Cash on Delivery
}

export interface OrderData {
  items: CartItem[];
  totalUSD: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  delivery: {
    city: string;
    branch: string;
  };
  paymentMethod: PaymentMethod;
  comment?: string;
  createdAt: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  location: string;
}

export interface OrderRead {
  id: number;
  status: string;
  totalUSD: number;
  totalUAH: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  delivery_city: string;
  delivery_branch: string;
  payment_method: string;
  ttn?: string;
  comment?: string;
  created_at: string;
  items: {
    product_id: string;
    product_name?: string;
    product_image?: string | null;
    quantity: number;
    price_at_purchase: number;
  }[];
}

export interface Customer {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  is_verified: boolean;
  created_at: string;
  discount_percent: number;
  discount_type: string;
  discount_value: number;
}
