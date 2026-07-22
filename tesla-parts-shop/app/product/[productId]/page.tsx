import React from "react";
import Link from "next/link";
import { api } from "../../../services/api";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await api.getProduct(resolvedParams.productId);
    return {
      title: product.meta_title || `${product.name} | Tesla Parts UA`,
      description:
        product.meta_description ||
        product.description ||
        `Придбати ${product.name} для Tesla з доставкою по Україні.`,
      openGraph: {
        title: product.meta_title || `${product.name} | Tesla Parts UA`,
        description:
          product.meta_description ||
          product.description ||
          `Придбати ${product.name} для Tesla з доставкою по Україні.`,
        images: product.image ? [{ url: product.image }] : [],
      },
    };
  } catch (e) {
    console.error("Failed to generate product page metadata:", e);
    return {
      title: "Деталі товару | Tesla Parts UA",
      description: "Придбати запчастини для Tesla.",
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  let product = null;
  try {
    const resolvedParams = await params;
    product = await api.getProduct(resolvedParams.productId);
  } catch (e) {
    console.error("Failed to load product details on server:", e);
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

  return <ProductDetailClient product={product} />;
}
