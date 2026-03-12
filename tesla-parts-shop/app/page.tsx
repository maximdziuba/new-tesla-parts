'use client';

import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import SeoHead from '../components/SeoHead';
import { Product } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { currency, uahPerUsd, addToCart, staticSeo, loading: appLoading } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await api.getProducts({ limit: 8 });
        setProducts(data);
      } catch (e) {
        console.error("Failed to load popular products", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleSelectCategory = (category: string) => {
    const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');
    router.push(`/category/${slugify(category)}`);
  };

  const seoRecord = staticSeo['home'];
  const fallbackTitle = 'Магазин запчастин для електромобілів';
  const fallbackDescription = 'Популярні запчастини Tesla з гарантією якості та швидкою доставкою по Україні.';

  if (loading || appLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={seoRecord?.meta_title}
        description={seoRecord?.meta_description}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      />
      <div className="w-full min-h-[280px] md:min-h-[400px] lg:min-h-[500px]">
         <Hero onSelectCategory={handleSelectCategory} />
      </div>
      <div className="mt-8">
        <ProductList
          title="Популярні товари"
          products={products}
          currency={currency}
          uahPerUsd={uahPerUsd}
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
        />
      </div>
    </>
  );
}
