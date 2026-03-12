'use client';

import React, { useState, useEffect, Suspense } from 'react';
import ProductList from '../../components/ProductList';
import SeoHead from '../../components/SeoHead';
import { Product } from '../../types';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchResults() {
  const { currency, uahPerUsd, addToCart, staticSeo, loading: appLoading } = useApp();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const data = await api.getProducts({ search: searchQuery });
        setProducts(data);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const seoRecord = staticSeo['search'];
  const normalizedQuery = searchQuery || 'запчастини';
  const fallbackTitle = `Пошук: ${normalizedQuery}`;
  const fallbackDescription = `Результати пошуку "${normalizedQuery}" у Auto Parts Store. Знайдіть сумісні запчастини для свого авто.`;

  return (
    <div className="mt-8">
      <SeoHead
        title={seoRecord?.meta_title}
        description={seoRecord?.meta_description}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Результати пошуку: "{searchQuery}"</h1>
      </div>
      {loading || appLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
        </div>
      ) : (
        <ProductList
          products={products}
          currency={currency}
          uahPerUsd={uahPerUsd}
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div></div>}>
      <SearchResults />
    </Suspense>
  );
}
