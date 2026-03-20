import React from 'react';
import CategoryView from '../../../../../components/CategoryView';
import { api } from '../../../../../services/api';
import { Metadata } from 'next';
import { Subcategory } from '../../../../../types';

interface PageProps {
  params: Promise<{ slug: string; subId: string }>;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

function findSubcategory(subs: Subcategory[], targetId: number): Subcategory | null {
  for (const sub of subs) {
    if (sub.id === targetId) return sub;
    if (sub.subcategories) {
      const found = findSubcategory(sub.subcategories, targetId);
      if (found) return found;
    }
  }
  return null;
}

async function getCategoryData(slug: string, subIdStr: string) {
  const subId = Number(subIdStr);
  const categories = await api.getCategories();
  const currentCategory = categories.find(c => slugify(c.name) === slug);
  if (!currentCategory) return null;

  const detailedCategory = await api.getCategory(currentCategory.id);
  const subcategory = findSubcategory(detailedCategory.subcategories || [], subId);
  const products = await api.getProducts({ category: slug, subId });

  return { detailedCategory, subcategory, products, subId };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subId } = await params;
  const data = await getCategoryData(slug, subId);
  if (!data) return { title: 'Категорію не знайдено' };

  const title = data.subcategory ? data.subcategory.name : data.detailedCategory.name;
  return {
    title: `${title} - ${data.detailedCategory.name}`,
    description: `Запчастини підкатегорії ${title} для ${data.detailedCategory.name}`,
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { slug, subId: subIdStr } = await params;
  const data = await getCategoryData(slug, subIdStr);

  if (!data) {
    return <div className="py-20 text-center">Категорію не знайдено</div>;
  }

  return (
    <CategoryView
      slug={slug}
      subId={data.subId}
      initialCategory={data.detailedCategory}
      initialProducts={data.products}
    />
  );
}
