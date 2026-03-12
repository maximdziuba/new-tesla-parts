'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductList from '../components/ProductList';
import SubcategoryCard from '../components/SubcategoryCard';
import SeoHead from '../components/SeoHead';
import { Category, Subcategory, Product } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const compareBySortOrder = <T extends { sort_order?: number | null; id?: number }>(a: T, b: T) => {
  const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
  if (orderDiff !== 0) return orderDiff;
  if (a.id !== undefined && b.id !== undefined) {
    return a.id - b.id;
  }
  return 0;
};

const sortSubcategoryTreeData = (subs?: Subcategory[]): Subcategory[] => {
  if (!subs) return [];
  return [...subs]
    .sort(compareBySortOrder)
    .map(sub => ({
      ...sub,
      subcategories: sortSubcategoryTreeData(sub.subcategories),
    }));
};

const CategoryViewComponent: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { slug, subId: subIdParam } = params;
  const subId = subIdParam ? Number(subIdParam) : null;

  const { categories, currency, uahPerUsd, addToCart, loading: appLoading } = useApp();
  
  const currentCategory = useMemo(() => {
    return categories.find(c => slugify(c.name) === slug);
  }, [categories, slug]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [detailedCategory, setDetailedCategory] = useState<Category | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);

  useEffect(() => {
    if (!currentCategory) return;
    
    const fetchDetails = async () => {
      setLoadingCategory(true);
      try {
        const fullData = await api.getCategory(currentCategory.id);
        const sorted = {
            ...fullData,
            subcategories: sortSubcategoryTreeData(fullData.subcategories)
        };
        setDetailedCategory(sorted);
      } catch (e) {
        console.error("Failed to fetch category details", e);
      } finally {
        setLoadingCategory(false);
      }
    };
    fetchDetails();
  }, [currentCategory]);

  useEffect(() => {
    if (!slug) return;
    
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const filters: any = { category: slug };
        if (subId) {
          filters.subId = subId;
        }
        const data = await api.getProducts(filters);
        setProducts(data);
      } catch (e) {
        console.error("Failed to fetch category products", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [slug, subId]);

  const findSubcategory = (subs: Subcategory[], targetId: number): Subcategory | null => {
    if (!subs) return null;
    for (const sub of subs) {
      if (sub.id === targetId) {
        return sub;
      }
      if (sub.subcategories) {
        const found = findSubcategory(sub.subcategories, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const currentSubcategory = subId && detailedCategory
    ? findSubcategory(detailedCategory.subcategories, subId)
    : null;

  useEffect(() => {
    if (!loadingCategory && subId && !currentSubcategory && detailedCategory && detailedCategory.subcategories && detailedCategory.subcategories.length > 0) {
      router.replace(`/category/${slug}`);
    }
  }, [subId, currentSubcategory, router, slug, loadingCategory, detailedCategory]);

  const getBackLink = (): string => {
    if (!subId || !detailedCategory) return '/';
    
    const findParent = (subs: Subcategory[], target: number, parent: number | null = null): number | null => {
      if (!subs) return null;
      for (const sub of subs) {
        if (sub.id === target) {
          return parent;
        }
        if (sub.subcategories) {
          const result = findParent(sub.subcategories, target, sub.id);
          if (result !== null && result !== undefined) {
            return result;
          }
        }
      }
      return null;
    };
    
    const parentId = findParent(detailedCategory.subcategories, subId, null);
    if (parentId) {
      return `/category/${slug}/sub/${parentId}`;
    } else {
      return `/category/${slug}`;
    }
  };

  const getSelectedSubcategoryName = () => {
    if (!subId || !detailedCategory) return currentCategory?.name || '';
    const found = findSubcategory(detailedCategory.subcategories, subId);
    return found?.name || currentCategory?.name || '';
  };

  const getBreadcrumbs = () => {
    if (!currentCategory) return [];
    const crumbs = [{ name: currentCategory.name, url: `/category/${slug}` }];
    if (subId && detailedCategory) {
      const findPath = (subs: Subcategory[], target: number, currentPath: Subcategory[] = []): Subcategory[] | null => {
        for (const sub of subs) {
          const newPath = [...currentPath, sub];
          if (sub.id === target) return newPath;
          if (sub.subcategories) {
            const found = findPath(sub.subcategories, target, newPath);
            if (found) return found;
          }
        }
        return null;
      };
      const path = findPath(detailedCategory.subcategories, subId);
      if (path) {
        path.forEach(p => crumbs.push({ name: p.name, url: `/category/${slug}/sub/${p.id}` }));
      }
    }
    return crumbs;
  };

  const subcategoriesToShow = useMemo(() => {
    if (loadingCategory || !detailedCategory) return [];
    
    const base = subId
      ? currentSubcategory?.subcategories || []
      : detailedCategory.subcategories;
    return sortSubcategoryTreeData(base);
  }, [subId, currentSubcategory, detailedCategory, loadingCategory]);

  if (appLoading || (!currentCategory && !loadingCategory)) {
    if (!appLoading && !currentCategory) {
        return <div>Категорію не знайдено</div>;
    }
    return (
        <div className="flex justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
          </div>
        </div>
      );
  }

  const pageHeading = getSelectedSubcategoryName();
  const fallbackTitle = `${pageHeading}`;
  const fallbackDescription = subId
    ? `Запчастини підкатегорії ${pageHeading} в категорії ${currentCategory?.name}.`
    : `Категорія ${currentCategory?.name}: підберіть запчастини для вашого авто.`;

  const backLink = getBackLink();
  const loading = loadingProducts || loadingCategory;

  return (
    <div className="mt-8">
      <SeoHead
        title={currentCategory?.meta_title || undefined}
        description={currentCategory?.meta_description || undefined}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      />
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-blue-600 transition">Головна</Link>
        {getBreadcrumbs().map((crumb, idx, arr) => (
          <React.Fragment key={crumb.url}>
            <span className="text-gray-400">&gt;</span>
            <Link 
              href={crumb.url} 
              className={`hover:text-blue-600 transition ${idx === arr.length - 1 ? 'font-semibold text-slate-900' : ''}`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">{pageHeading}</h1>
      </div>

      {subcategoriesToShow.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {subcategoriesToShow.map(sub => (
            <SubcategoryCard
              key={sub.id}
              subcategory={sub}
              onClick={() => router.push(`/category/${slug}/sub/${sub.id}`)}
            />
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        products.length > 0 && (
          <ProductList
            title={subcategoriesToShow.length > 0 ? "Товари" : undefined}
            products={products}
            currency={currency}
            uahPerUsd={uahPerUsd}
            onAddToCart={addToCart}
            onProductClick={(p) => router.push(`/product/${p.id}`)}
          />
        )
      )}

      {!loading && subcategoriesToShow.length === 0 && products.length === 0 && (
        <p className="text-gray-500 italic">В цій категорії поки немає товарів чи підкатегорій.</p>
      )}
    </div>
  );
};

export default CategoryViewComponent;
