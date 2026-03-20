import React from 'react';
import CategoryView from '../../../components/CategoryView';
import { api } from '../../../services/api';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

async function getCategoryData(slug: string) {
  const categories = await api.getCategories();
  const currentCategory = categories.find(c => slugify(c.name) === slug);
  if (!currentCategory) return null;

  const detailedCategory = await api.getCategory(currentCategory.id);
  const products = await api.getProducts({ category: slug });

  return { detailedCategory, products };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return { title: 'Категорію не знайдено' };

  return {
    title: data.detailedCategory.meta_title || data.detailedCategory.name,
    description: data.detailedCategory.meta_description || `Запчастини для ${data.detailedCategory.name}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    return <div className="py-20 text-center">Категорію не знайдено</div>;
  }

  return (
    <CategoryView
      slug={slug}
      subId={null}
      initialCategory={data.detailedCategory}
      initialProducts={data.products}
    />
  );
}
