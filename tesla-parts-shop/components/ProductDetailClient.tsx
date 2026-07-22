"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProductPage from "./ProductPage";
import { Product, Category, Subcategory } from "../types";
import { useApp } from "../context/AppContext";

interface ProductDetailClientProps {
  product: Product;
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

const parseProductCategories = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPrimaryCategory = (value?: string | null) => {
  const categories = parseProductCategories(value);
  return categories.length > 0 ? categories[0] : "";
};

const getProductSubcategoryIds = (product: Product): number[] => {
  if (product.subcategory_ids && product.subcategory_ids.length > 0) {
    return product.subcategory_ids;
  }
  return product.subcategory_id ? [product.subcategory_id] : [];
};

const categoryContainsSubcategory = (
  subs: Subcategory[] | undefined,
  targetId: number,
): boolean => {
  if (!subs) return false;
  for (const sub of subs) {
    if (sub.id === targetId) {
      return true;
    }
    if (
      sub.subcategories &&
      categoryContainsSubcategory(sub.subcategories, targetId)
    ) {
      return true;
    }
  }
  return false;
};

const findCategorySlugForSubcategory = (
  categories: Category[],
  targetId: number,
): string | null => {
  for (const category of categories) {
    if (categoryContainsSubcategory(category.subcategories, targetId)) {
      return slugify(category.name);
    }
  }
  return null;
};

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { currency, uahPerUsd, addToCart, categories, hasInternalHistory } =
    useApp();

  const handleProductBack = (product: Product) => {
    if (hasInternalHistory) {
      router.back();
      return;
    }

    const subcategoryIds = getProductSubcategoryIds(product);
    if (subcategoryIds.length > 0) {
      const targetSubId = subcategoryIds[0];
      const categorySlug = findCategorySlugForSubcategory(
        categories,
        targetSubId,
      );
      if (categorySlug) {
        router.push(`/category/${categorySlug}/sub/${targetSubId}`);
        return;
      }
    }

    const primaryCategory = getPrimaryCategory(product.category);
    if (primaryCategory) {
      router.push(`/category/${slugify(primaryCategory)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <ProductPage
      product={product}
      currency={currency}
      uahPerUsd={uahPerUsd}
      onAddToCart={addToCart}
      onBack={() => handleProductBack(product)}
      onProductClick={(nextProduct) =>
        router.push(`/product/${nextProduct.id}`)
      }
    />
  );
}
