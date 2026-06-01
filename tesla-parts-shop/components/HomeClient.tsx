'use client';

import { useState } from 'react';
import Hero from './Hero';
import ProductList from './ProductList';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const { currency, uahPerUsd, addToCart, loading: appLoading } = useApp();
  const [products] = useState<Product[]>(initialProducts);
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleSelectCategory = (category: string) => {
    const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');
    router.push(`/category/${slugify(category)}`);
  };

  if (appLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-[280px] md:min-h-[400px] lg:min-h-[500px]">
         <Hero onSelectCategory={handleSelectCategory} />
      </div>
      {products.length > 0 && (
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
      )}
    </>
  );
}
