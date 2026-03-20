import React from 'react';
import ProductPage from '../../../components/ProductPage';
import { api } from '../../../services/api';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  try {
    const product = await api.getProduct(productId);
    if (!product) return { title: 'Товар не знайдено' };

    return {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description.slice(0, 160),
      openGraph: {
        title: product.meta_title || product.name,
        description: product.meta_description || product.description.slice(0, 160),
        images: [product.image],
      },
    };
  } catch (e) {
    return { title: 'Товар не знайдено' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  let product = null;

  try {
    product = await api.getProduct(productId);
  } catch (e) {
    console.error("Failed to fetch product on server", e);
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 mb-4">Товар не знайдено.</p>
        <Link
          href="/"
          className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-2 rounded-md transition inline-block"
        >
          На головну
        </Link>
      </div>
    );
  }

  return <ProductPage product={product} />;
}
