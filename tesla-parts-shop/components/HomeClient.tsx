'use client';

import React, { useEffect } from 'react';
import ProductList from './ProductList';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

interface HomeClientProps {
  initialProducts: Product[];
}

const HomeClient: React.FC<HomeClientProps> = ({ initialProducts }) => {
  const { currency, uahPerUsd, addToCart } = useApp();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <ProductList
      title="Популярні товари"
      products={initialProducts}
      currency={currency}
      uahPerUsd={uahPerUsd}
      onAddToCart={addToCart}
      onProductClick={handleProductClick}
    />
  );
};

export default HomeClient;
