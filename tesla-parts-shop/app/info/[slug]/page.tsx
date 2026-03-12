'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import StaticPage from '../../../components/StaticPage';
import { useApp } from '../../../context/AppContext';

export default function InfoPage() {
  const { slug } = useParams();
  const { staticSeo } = useApp();
  const router = useRouter();

  if (!slug) return null;

  return (
    <StaticPage 
      slug={slug as string} 
      onBack={() => router.push('/')} 
      seo={staticSeo[slug as string]} 
    />
  );
}
