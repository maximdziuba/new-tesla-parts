'use client';

import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-8 min-h-[80vh] animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
        <CheckCircle size={40} />
      </div>
      <h1 className="text-3xl font-bold text-center mb-4">Замовлення успішно оформлено!</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Дякуємо за покупку. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей.
      </p>
      <Link
        href="/"
        className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-md hover:bg-gray-800 transition inline-block text-center"
      >
        На головну
      </Link>
    </div>
  );
}
