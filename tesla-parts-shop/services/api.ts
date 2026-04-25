import { Product, OrderData, Category, StaticSeoRecord, Page } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ProductFilter {
  category?: string;
  subId?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

export const api = {
    getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category_slug', filters.category);
        if (filters.subId) params.append('subcategory_id', filters.subId.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.search) params.append('search', filters.search);

        const res = await fetch(`${API_URL}/products/?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    getProduct: async (id: string): Promise<Product> => {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
    },

    getLabels: async (): Promise<string[]> => {
        const res = await fetch(`${API_URL}/products/labels`);
        if (!res.ok) throw new Error('Failed to fetch labels');
        return res.json();
    },

    getCategories: async (): Promise<Category[]> => {
        const res = await fetch(`${API_URL}/categories/`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    getCategory: async (id: number): Promise<Category> => {
        const res = await fetch(`${API_URL}/categories/${id}`);
        if (!res.ok) throw new Error('Failed to fetch category details');
        return res.json();
    },

    createOrder: async (orderData: OrderData) => {
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
    },

    getPage: async (slug: string): Promise<Page | null> => {
        try {
            const res = await fetch(`${API_URL}/pages/${slug}`);
            if (!res.ok) return null;
            return res.json();
        } catch {
            return null;
        }
    },

    getPagesBySlugs: async (slugs: string[]): Promise<Page[]> => {
        const res = await fetch(`${API_URL}/pages/by-slugs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs }),
        });
        if (!res.ok) throw new Error('Failed to fetch pages');
        return res.json();
    },

    getSetting: async (key: string): Promise<string | null> => {
        try {
            const res = await fetch(`${API_URL}/settings/${key}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.value;
        } catch {
            return null;
        }
    },

    getSocialLinks: async (): Promise<{ instagram?: string; telegram?: string; whatsapp?: string; viber?: string }> => {
        const res = await fetch(`${API_URL}/settings/social-links`);
        if (!res.ok) throw new Error('Failed to fetch social links');
        return res.json();
    },

    getStaticSeo: async (): Promise<StaticSeoRecord[]> => {
        const res = await fetch(`${API_URL}/seo/static`);
        if (!res.ok) throw new Error('Failed to fetch static SEO data');
        return res.json();
    },

    getFeedback: async (): Promise<any[]> => {
        const res = await fetch(`${API_URL}/feedback/`);
        if (!res.ok) throw new Error('Failed to fetch feedback');
        return res.json();
    }
};

