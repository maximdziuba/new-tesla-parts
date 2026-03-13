'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Currency, CartItem, Category, StaticSeoRecord, Page } from '../types';
import { api } from '../services/api';
import { DEFAULT_EXCHANGE_RATE_UAH_PER_USD } from '../constants';

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  uahPerUsd: number;
  categories: Category[];
  headerPages: Page[];
  socialLinks: { instagram?: string; telegram?: string; whatsapp?: string; viber?: string };
  contactInfo: {
    email: string;
    phone: string;
    footerDescription: string;
    footerText: string;
  };
  staticSeo: Record<string, StaticSeoRecord>;
  loading: boolean;
  cartTotalUSD: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tesla-parts-cart';
const THEME_STORAGE_KEY = 'tesla-parts-theme';

const getInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed: CartItem[] = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load cart from storage', err);
  }
  return [];
};

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getProductUsdPrice = (product: Product, rate: number): number => {
  if (product.priceUSD && product.priceUSD > 0) {
    return product.priceUSD;
  }
  if (product.priceUAH && product.priceUAH > 0 && rate > 0) {
    return product.priceUAH / rate;
  }
  return 0;
};

const compareBySortOrder = <T extends { sort_order?: number | null; id?: number }>(a: T, b: T) => {
  const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  if (a.id !== undefined && b.id !== undefined) {
    return a.id - b.id;
  }
  return 0;
};

const sortSubcategoryTreeData = (subs?: any[]): any[] => {
  if (!subs) return [];
  return [...subs]
    .sort(compareBySortOrder)
    .map(sub => ({
      ...sub,
      subcategories: sortSubcategoryTreeData(sub.subcategories),
    }));
};

const sortCategoryTreeData = (cats: Category[]): Category[] => {
  return [...cats]
    .sort(compareBySortOrder)
    .map(cat => ({
      ...cat,
      subcategories: sortSubcategoryTreeData(cat.subcategories),
    }));
};

// --- Image Preloader ---
const preloadImages = async (imageUrls: (string | undefined)[]) => {
  if (typeof window === 'undefined') return;
  const promises = imageUrls.filter(Boolean).map((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src!;
      img.onload = resolve;
      img.onerror = resolve; 
    });
  });
  await Promise.all(promises);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>(Currency.UAH);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [uahPerUsd, setUahPerUsd] = useState(DEFAULT_EXCHANGE_RATE_UAH_PER_USD);
  const [categories, setCategories] = useState<Category[]>([]);
  const [headerPages, setHeaderPages] = useState<Page[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ instagram?: string; telegram?: string; whatsapp?: string; viber?: string }>({ 
    instagram: '', 
    telegram: '', 
    whatsapp: '', 
    viber: '' 
  });
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    footerDescription: '',
    footerText: '',
  });
  const [staticSeo, setStaticSeo] = useState<Record<string, StaticSeoRecord>>({});
  const [loading, setLoading] = useState(true);

  // Load cart from local storage on mount
  useEffect(() => {
    setCart(getInitialCart());
    setTheme(getInitialTheme());
  }, []);

  // Theme application and system listener
  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // ONLY auto-adjust if there is no manual preference in localStorage
      const manualPreference = localStorage.getItem(THEME_STORAGE_KEY);
      if (!manualPreference) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Explicitly save manual preference
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Save cart to local storage on changes
  useEffect(() => {
    if (cart.length > 0 || (typeof window !== 'undefined' && localStorage.getItem(CART_STORAGE_KEY))) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const headerPageSlugs = ['about', 'delivery', 'returns', 'contacts', 'faq', 'terms-of-service', 'privacy-policy'];
        const [categoriesData, socialLinksData, pagesData, staticSeoData] = await Promise.all([
          api.getCategories(),
          api.getSocialLinks(),
          api.getPagesBySlugs(headerPageSlugs),
          api.getStaticSeo(),
        ]);

        const sortedCats = sortCategoryTreeData(categoriesData);
        setCategories(sortedCats);
        setSocialLinks(socialLinksData);
        setHeaderPages(pagesData);

        const seoMap: Record<string, StaticSeoRecord> = {};
        staticSeoData.forEach(record => {
          seoMap[record.slug] = record;
        });
        setStaticSeo(seoMap);

        // Preload critical images
        const heroImages = sortedCats.slice(0, 4).map(c => c.image);
        await preloadImages(heroImages);

      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const value = await api.getSetting('exchange_rate');
        const parsed = value ? parseFloat(value) : NaN;
        if (!Number.isNaN(parsed) && parsed > 0) {
          setUahPerUsd(parsed);
        }
      } catch (e) {
        console.error("Failed to load exchange rate", e);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    const loadContactInfo = async () => {
      const fetchSetting = async (key: string) => {
        try {
          const value = await api.getSetting(key);
          return value || '';
        } catch {
          return '';
        }
      };
      const [email, phone, footerDescription, footerText] = await Promise.all([
        fetchSetting('contact_email'),
        fetchSetting('contact_phone'),
        fetchSetting('footer_description'),
        fetchSetting('footer_text'),
      ]);
      setContactInfo({
        email,
        phone,
        footerDescription,
        footerText,
      });
    };
    loadContactInfo();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotalUSD = useMemo(() => {
    const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;
    return cart.reduce((sum, item) => {
      const priceUSD = getProductUsdPrice(item, effectiveRate);
      return sum + priceUSD * item.quantity;
    }, 0);
  }, [cart, uahPerUsd]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        currency,
        setCurrency,
        theme,
        toggleTheme,
        uahPerUsd,
        categories,
        headerPages,
        socialLinks,
        contactInfo,
        staticSeo,
        loading,
        cartTotalUSD,
        cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
