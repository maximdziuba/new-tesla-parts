'use client';

import React from 'react';
import Link from 'next/link';
import ShopLogo from './ShopLogo';
import { useApp } from '../context/AppContext';
import { Send, MessageSquare, Phone } from 'lucide-react';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Footer: React.FC = () => {
  const { categories, socialLinks, contactInfo } = useApp();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedCategories = [...categories].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 py-12 mt-auto transition-colors">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <ShopLogo />
          </div>
          <p className="text-sm leading-relaxed">
            {isMounted ? (contactInfo.footerDescription || 'Ваш надійний партнер у світі запчастин для електромобілів.') : ''}
          </p>
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-4">Навігація</h3>
          <ul className="space-y-2 text-sm">
            {sortedCategories.slice(0, 4).map(cat => (
              <li key={cat.id}>
                <Link 
                  href={`/category/${slugify(cat.name)}`} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition block"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-4">Клієнтам</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/info/delivery" className="hover:text-blue-600 dark:hover:text-blue-400 transition block">Доставка та оплата</Link></li>
            <li><Link href="/info/returns" className="hover:text-blue-600 dark:hover:text-blue-400 transition block">Повернення</Link></li>
            <li><Link href="/info/contacts" className="hover:text-blue-600 dark:hover:text-blue-400 transition block">Контакти</Link></li>
            <li><Link href="/info/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition block">Політика конфіденційності</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-4">Контакти</h3>
          <p className="text-sm mb-2 font-medium text-slate-700 dark:text-slate-300">
            {isMounted ? (contactInfo.phone || '+38 (099) 123-45-67') : ''}
          </p>
          <p className="text-sm mb-2">
            {isMounted ? (contactInfo.email || 'info@autoparts.ua') : ''}
          </p>
          <div className="flex gap-3 mt-4">
            {isMounted && socialLinks.telegram && (
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition text-slate-600 dark:text-slate-400" title="Telegram">
                <Send size={18} />
              </a>
            )}
            {isMounted && socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white dark:hover:bg-green-600 transition text-slate-600 dark:text-slate-400" title="WhatsApp">
                <MessageSquare size={18} />
              </a>
            )}
            {isMounted && socialLinks.viber && (
              <a href={socialLinks.viber} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition text-slate-600 dark:text-slate-400" title="Viber">
                <Phone size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 text-center text-xs">
        {isMounted ? (contactInfo.footerText || '© 2026 Tesla Parts Shop. Всі права захищені.') : ''}
      </div>
    </footer>
  );
};

export default Footer;
