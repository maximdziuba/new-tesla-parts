import { api } from '../services/api';
import HomeClient from '../components/HomeClient';
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await api.getStaticSeo();
    const seoRecord = seo.find(s => s.slug === 'home');
    return {
      title: seoRecord?.meta_title || 'Магазин запчастин для електромобілів',
      description: seoRecord?.meta_description || 'Популярні запчастини Tesla з гарантією якості та швидкою доставкою по Україні.',
    };
  } catch (e) {
    console.error('Failed to generate home page metadata:', e);
    return {
      title: 'Магазин запчастин для електромобілів',
      description: 'Популярні запчастини Tesla з гарантією якості та швидкою доставкою по Україні.',
    };
  }
}

export default async function Home() {
  const products = await api.getProducts({ limit: 8, is_favourite: true });
  return <HomeClient initialProducts={products} />;
}
