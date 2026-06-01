import React, { Suspense } from 'react';
import SearchClient from '../../components/SearchClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пошук запчастин | TeslaFix',
  description: 'Знайдіть необхідні запчастини для вашої Tesla у нашому каталозі.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}
