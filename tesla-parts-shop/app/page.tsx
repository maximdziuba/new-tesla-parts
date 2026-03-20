import React from 'react';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import { api } from '../services/api';
import { Metadata } from 'next';
import HomeClient from '../components/HomeClient';

export async function generateMetadata(): Promise<Metadata> {
  const staticSeoData = await api.getStaticSeo();
  const seoRecord = staticSeoData.find(r => r.slug === 'home');

  return {
    title: seoRecord?.meta_title || 'TeslaFix | Магазин запчастин для електромобілів',
    description: seoRecord?.meta_description || 'Популярні запчастини Tesla з гарантією якості та швидкою доставкою по Україні.',
  };
}

export default async function Home() {
  const products = await api.getProducts({ limit: 8 });

  return (
    <>
      <div className="w-full min-h-[280px] md:min-h-[400px] lg:min-h-[500px]">
         <Hero />
      </div>
      <div className="mt-8">
        <HomeClient initialProducts={products} />
      </div>
    </>
  );
}
