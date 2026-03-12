'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductPage from '../../../components/ProductPage';
import { Product, Category, Subcategory } from '../../../types';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import Link from 'next/link';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const parseProductCategories = (value?: string | null) => {
  if (!value) return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

const getPrimaryCategory = (value?: string | null) => {
  const categories = parseProductCategories(value);
  return categories.length > 0 ? categories[0] : '';
};

const getProductSubcategoryIds = (product: Product): number[] => {
  if (product.subcategory_ids && product.subcategory_ids.length > 0) {
    return product.subcategory_ids;
  }
  return product.subcategory_id ? [product.subcategory_id] : [];
};

const categoryContainsSubcategory = (subs: Subcategory[] | undefined, targetId: number): boolean => {
  if (!subs) return false;
  for (const sub of subs) {
    if (sub.id === targetId) {
      return true;
    }
    if (sub.subcategories && categoryContainsSubcategory(sub.subcategories, targetId)) {
      return true;
    }
  }
  return false;
};

const findCategorySlugForSubcategory = (categories: Category[], targetId: number): string | null => {
  for (const category of categories) {
    if (categoryContainsSubcategory(category.subcategories, targetId)) {
      return slugify(category.name);
    }
  }
  return null;
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currency, uahPerUsd, addToCart, categories } = useApp();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const data = await api.getProduct(productId as string);
        setProduct(data);
      } catch (e) {
        console.error("Failed to fetch product", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleProductBack = (product: Product) => {
    const subcategoryIds = getProductSubcategoryIds(product);
    if (subcategoryIds.length > 0) {
      const targetSubId = subcategoryIds[0];
      const categorySlug = findCategorySlugForSubcategory(categories, targetSubId);
      if (categorySlug) {
        router.push(`/category/${categorySlug}/sub/${targetSubId}`);
        return;
      }
    }

    const primaryCategory = getPrimaryCategory(product.category);
    if (primaryCategory) {
      router.push(`/category/${slugify(primaryCategory)}`);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 mb-4">Товар не знайдено.</p>
        <Link
          href="/"
          className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-2 rounded-md hover:bg-gray-800 transition inline-block"
        >
          На головну
        </Link>
      </div>
    );
  }

  return (
    <ProductPage
      product={product}
      currency={currency}
      uahPerUsd={uahPerUsd}
      onAddToCart={addToCart}
      onBack={() => handleProductBack(product)}
    />
  );
}
