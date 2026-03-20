'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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

interface CategoryViewProps {
    slug: string;
    subId: number | null;
    initialCategory: Category;
    initialProducts: Product[];
}

const CategoryViewComponent: React.FC<CategoryViewProps> = ({ slug, subId, initialCategory, initialProducts }) => {
  const router = useRouter();
  const { categories, currency, uahPerUsd, addToCart, loading: appLoading } = useApp();
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [detailedCategory, setDetailedCategory] = useState<Category>(initialCategory);
  const [loadingCategory, setLoadingCategory] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, subId]);

  // Update data if props change (e.g. navigation)
  useEffect(() => {
    setDetailedCategory(initialCategory);
    setProducts(initialProducts);
  }, [initialCategory, initialProducts]);

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
    ? findSubcategory(detailedCategory.subcategories || [], subId)
    : null;

  const getSelectedSubcategoryName = () => {
    if (!subId || !detailedCategory) return initialCategory?.name || '';
    const found = findSubcategory(detailedCategory.subcategories || [], subId);
    return found?.name || detailedCategory?.name || '';
  };

  const getBreadcrumbs = () => {
    if (!detailedCategory) return [];
    const crumbs = [{ name: detailedCategory.name, url: `/category/${slug}` }];
    if (subId && detailedCategory.subcategories) {
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
    const base = subId
      ? currentSubcategory?.subcategories || []
      : detailedCategory.subcategories || [];
    return sortSubcategoryTreeData(base);
  }, [subId, currentSubcategory, detailedCategory]);

  const pageHeading = getSelectedSubcategoryName();
  const fallbackTitle = `${pageHeading}`;
  const fallbackDescription = subId
    ? `Запчастини підкатегорії ${pageHeading} в категорії ${detailedCategory?.name}.`
    : `Категорія ${detailedCategory?.name}: підберіть запчастини для вашого авто.`;

  const loading = loadingProducts || loadingCategory;

  return (
    <div className="mt-8">
      <SeoHead
        title={detailedCategory?.meta_title || undefined}
        description={detailedCategory?.meta_description || undefined}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      />
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap custom-scrollbar">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Головна</Link>
        {getBreadcrumbs().map((crumb, idx, arr) => (
          <React.Fragment key={crumb.url}>
            <span className="text-gray-400 dark:text-slate-600">&gt;</span>
            <Link 
              href={crumb.url} 
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${idx === arr.length - 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{pageHeading}</h1>
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
        <p className="text-gray-500 dark:text-slate-400 italic">В цій категорії поки немає товарів чи підкатегорій.</p>
      )}
    </div>
  );
};

export default CategoryViewComponent;
