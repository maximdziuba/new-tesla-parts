import { Product, OrderData, Category, StaticSeoRecord, Page, OrderRead, CartItem } from '../types';

const getApiUrl = () => {
    if (typeof window === 'undefined') {
        // Server-side (SSR): Connect directly to backend container in Docker network
        return 'http://backend:8000';
    }
    // Client-side (Browser): Connect to public API URL
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.teslafix.com.ua';
};

const API_URL = getApiUrl();

export interface ProductFilter {
  category?: string;
  subId?: number;
  limit?: number;
  offset?: number;
  search?: string;
  is_favourite?: boolean;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const handleAuthResponse = (res: Response) => {
    if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('customerToken');
            window.dispatchEvent(new Event('customer-logged-out'));
        }
    }
};

export const api = {
    getProducts: async (filters: ProductFilter = {}): Promise<Product[]> => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category_slug', filters.category);
        if (filters.subId) params.append('subcategory_id', filters.subId.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.is_favourite !== undefined) params.append('is_favourite', filters.is_favourite.toString());

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

        const token = localStorage.getItem('customerToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        handleAuthResponse(res);

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
    },

    registerCustomer: async (email: string) => {
        const res = await fetch(`${API_URL}/customers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to register');
        }
        return res.json();
    },

    forgotPassword: async (email: string) => {
        const res = await fetch(`${API_URL}/customers/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to request password reset');
        }
        return res.json();
    },

    resetPassword: async (data: any) => {
        const res = await fetch(`${API_URL}/customers/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to reset password');
        }
        return res.json();
    },

    verifyCustomer: async (data: any) => {
        const res = await fetch(`${API_URL}/customers/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to verify');
        }
        return res.json();
    },

    loginCustomer: async (data: any) => {
        const res = await fetch(`${API_URL}/customers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to login');
        }
        return res.json();
    },

    getMe: async () => {
        const token = localStorage.getItem('customerToken');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_URL}/customers/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        handleAuthResponse(res);
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
    },

    getMyOrders: async (): Promise<OrderRead[]> => {
        const token = localStorage.getItem('customerToken');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_URL}/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        handleAuthResponse(res);
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    getCart: async (): Promise<CartItem[]> => {
        const token = localStorage.getItem('customerToken');
        if (!token) return [];
        const res = await fetch(`${API_URL}/customers/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        handleAuthResponse(res);
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
    },

    saveCart: async (cartItems: CartItem[]): Promise<any> => {
        const token = localStorage.getItem('customerToken');
        if (!token) return null;
        const res = await fetch(`${API_URL}/customers/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cartItems),
        });
        handleAuthResponse(res);
        if (!res.ok) throw new Error('Failed to save cart');
        return res.json();
    },

    updateProfile: async (data: { first_name: string; last_name: string; phone: string }): Promise<any> => {
        const token = localStorage.getItem('customerToken');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_URL}/customers/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        handleAuthResponse(res);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to update profile');
        }
        return res.json();
    },

    validatePromoCode: async (code: string): Promise<{
        code: string;
        discount_type: 'percent' | 'usd' | 'uah';
        discount_value: number;
        valid: boolean;
    }> => {
        const token = localStorage.getItem('customerToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}/promocodes/validate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ code }),
        });
        
        handleAuthResponse(res);
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Недійсний промокод');
        }
        return res.json();
    }
};

