import { Product, OrderData, Category, StaticSeoRecord, Page } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PAGES, MOCK_STATIC_SEO } from '../constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ProductFilter {
  category?: string;
  subId?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

export const api = {
    getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
        await delay(500);
        let products = [...MOCK_PRODUCTS];
        
        if (filters.category) {
            products = products.filter(p => slugify(p.category).includes(filters.category!));
        }
        
        if (filters.search) {
            const s = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(s) || 
                p.description.toLowerCase().includes(s)
            );
        }

        return products;
        /*
        const params = new URLSearchParams();
        if (filters.category) params.append('category_slug', filters.category);
        if (filters.subId) params.append('subcategory_id', filters.subId.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.search) params.append('search', filters.search);

        const res = await fetch(`${API_URL}/products/?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
        */
    },

    getProduct: async (id: string): Promise<Product> => {
        await delay(300);
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        if (!product) throw new Error('Product not found');
        return product;
        /*
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
        */
    },

    getLabels: async (): Promise<string[]> => {
        return ['New', 'Sale', 'Popular'];
        /*
        const res = await fetch(`${API_URL}/products/labels`);
        if (!res.ok) throw new Error('Failed to fetch labels');
        return res.json();
        */
    },

    getCategories: async (): Promise<Category[]> => {
        await delay(400);
        return MOCK_CATEGORIES;
        /*
        const res = await fetch(`${API_URL}/categories/`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
        */
    },

    getCategory: async (id: number): Promise<Category> => {
        await delay(300);
        const cat = MOCK_CATEGORIES.find(c => c.id === id);
        if (!cat) throw new Error('Category not found');
        return cat;
        /*
        const res = await fetch(`${API_URL}/categories/${id}`);
        if (!res.ok) throw new Error('Failed to fetch category details');
        return res.json();
        */
    },

    createOrder: async (orderData: OrderData) => {
        await delay(1000);
        console.log("Mock Order Created:", orderData);
        return { id: Math.floor(Math.random() * 10000), ...orderData };
        /*
        const payload = {
            items: orderData.items,
            totalUSD: orderData.totalUSD,
            customer: orderData.customer,
            delivery: orderData.delivery,
            paymentMethod: orderData.paymentMethod
        };

        const res = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
        */
    },


    getPage: async (slug: string): Promise<Page | null> => {
        await delay(200);
        return MOCK_PAGES.find(p => p.slug === slug) || null;
        /*
        try {
            const res = await fetch(`${API_URL}/pages/${slug}`);
            if (!res.ok) return null;
            return res.json();
        } catch {
            return null;
        }
        */
    },

    getPagesBySlugs: async (slugs: string[]): Promise<Page[]> => {
        await delay(300);
        return MOCK_PAGES.filter(p => slugs.includes(p.slug));
        /*
        const res = await fetch(`${API_URL}/pages/by-slugs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs }),
        });
        if (!res.ok) throw new Error('Failed to fetch pages');
        return res.json();
        */
    },

    getSetting: async (key: string): Promise<string | null> => {
        if (key === 'exchange_rate') return '41.5';
        if (key === 'contact_phone') return '+38 (067) 123-45-67';
        if (key === 'contact_email') return 'office@tesla-parts.com.ua';
        return null;
        /*
        try {
            const res = await fetch(`${API_URL}/settings/${key}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.value;
        } catch {
            return null;
        }
        */
    },

    getSocialLinks: async (): Promise<{ instagram?: string; telegram?: string; whatsapp?: string; viber?: string }> => {
        return { telegram: 'https://t.me', whatsapp: 'https://wa.me', viber: 'viber://chat?number=' };
        /*
        const res = await fetch(`${API_URL}/settings/social-links`);
        if (!res.ok) throw new Error('Failed to fetch social links');
        return res.json();
        */
    },

    getStaticSeo: async (): Promise<StaticSeoRecord[]> => {
        return MOCK_STATIC_SEO;
        /*
        const res = await fetch(`${API_URL}/seo/static`);
        if (!res.ok) throw new Error('Failed to fetch static SEO data');
        return res.json();
        */
    }
};
