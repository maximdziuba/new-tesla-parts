'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';
import { useRouter } from 'next/navigation';

interface HeroProps {
  onSelectCategory?: (category: string) => void;
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Hero: React.FC<HeroProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  const handleSelect = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    } else {
      router.push(`/category/${slugify(categoryName)}`);
    }
  };

  return (
    <div className="mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-900 dark:text-white transition-colors">Оберіть модель вашого електромобіля</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleSelect(category.name)}
            className="group relative h-64 md:h-96 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900"
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all z-10" />
            <img
              src={category.image || 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/201411/model-y-exterior-right-front-three-quarter.jpeg?isig=0&q=80&q=80'}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 p-6 z-20 text-white w-full bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                Переглянути каталог <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          Завантаження категорій...
        </div>
      )}
    </div>
  );
};

export default Hero;
