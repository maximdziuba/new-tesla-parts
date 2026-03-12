'use client';

import React from 'react';
import Link from 'next/link';
import ShopLogo from './ShopLogo';
import { useApp } from '../context/AppContext';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Footer: React.FC = () => {
  const { categories, socialLinks, contactInfo } = useApp();

  const sortedCategories = [...categories].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));

  return (
    <footer className="bg-white text-slate-500 border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-white text-xl font-bold mb-4 flex items-center gap-2">
            <ShopLogo />
          </div>
          <p className="text-sm">
            {contactInfo.footerDescription || 'Ваш надійний партнер у світі запчастин для електромобілів.'}
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Навігація</h3>
          <ul className="space-y-2 text-sm">
            {sortedCategories.slice(0, 4).map(cat => (
              <li key={cat.id}>
                <Link 
                  href={`/category/${slugify(cat.name)}`} 
                  className="hover:text-white block"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Клієнтам</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/info/delivery" className="hover:text-white block">Доставка та оплата</Link></li>
            <li><Link href="/info/returns" className="hover:text-white block">Повернення</Link></li>
            <li><Link href="/info/contacts" className="hover:text-white block">Контакти</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Контакти</h3>
          <p className="text-sm mb-2">
            {contactInfo.phone || '+38 (099) 123-45-67'}
          </p>
          <p className="text-sm mb-2">
            {contactInfo.email || 'info@autoparts.ua'}
          </p>
          <div className="flex gap-4 mt-4">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition cursor-pointer text-white">IG</a>
            )}
            {socialLinks.telegram && (
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition cursor-pointer text-white">TG</a>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        {contactInfo.footerText || '© 2024 Auto Parts Store. Всі права захищені.'}
      </div>
    </footer>
  );
};

export default Footer;
