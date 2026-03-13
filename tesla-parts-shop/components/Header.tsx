'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, Send, ChevronDown, Sun, Moon, MessageSquare, Phone } from 'lucide-react';
import { Currency } from '../types';
import ShopLogo from './ShopLogo';
import Link from 'next/link';
import { formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Header: React.FC = () => {
  const {
    cartCount,
    cartTotalUSD,
    currency,
    uahPerUsd,
    categories,
    setCurrency,
    setIsCartOpen,
    setIsSidebarOpen,
    theme,
    toggleTheme,
    socialLinks,
    contactInfo,
    headerPages,
  } = useApp();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const pagesDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target as Node)) {
        setIsPagesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const displayCartTotal = (() => {
    const rate = uahPerUsd > 0 ? uahPerUsd : 1;
    return currency === Currency.UAH ? cartTotalUSD * rate : cartTotalUSD;
  })();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-[60] transition-colors">
      {/* Top Row: Utilities & Info */}
      <div className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 text-xs py-2 px-4 transition-colors">
        <div className="container mx-auto flex flex-row w-full justify-between items-center gap-2">
          <nav className="hidden md:flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start">
            {headerPages.filter(page => page.is_published).map((page) => (
              <Link 
                key={page.slug} 
                href={`/info/${page.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {page.title}
              </Link>
            ))}
          </nav>
          
          <div className="relative md:hidden" ref={pagesDropdownRef}>
            <button onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)} className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Навігація
              <ChevronDown size={16} />
            </button>
            {isPagesDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-md overflow-hidden z-20">
                {headerPages.filter(page => page.is_published).map((page) => (
                  <Link
                    key={page.slug}
                    href={`/info/${page.slug}`}
                    onClick={() => setIsPagesDropdownOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isMounted && contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                    {contactInfo.phone}
                </a>
            )}
            {isMounted && (
              <div className="flex items-center gap-3">
                {socialLinks.telegram && (
                  <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition" title="Telegram">
                    <Send size={16} />
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition" title="WhatsApp">
                    <MessageSquare size={16} />
                  </a>
                )}
                {socialLinks.viber && (
                  <a href={socialLinks.viber} target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 transition" title="Viber">
                    <Phone size={16} />
                  </a>
                )}
              </div>
            )}

            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title={isMounted ? (theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему') : ''}
            >
              {isMounted && (theme === 'light' ? <Moon size={16} /> : <Sun size={16} />)}
            </button>

            <div className="border-l border-gray-200 dark:border-slate-700 pl-4 flex gap-2">
              {Object.values(Currency).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`font-semibold ${currency === cur ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Main Nav, Logo, Cart */}
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Burger Menu for Mobile */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-900 dark:text-white hover:text-blue-600 transition"
            >
              <Menu size={28} />
            </button>

            {/* Logo - Mobile Only */}
            <div className="lg:hidden flex-shrink-0">
              <ShopLogo />
            </div>
          </div>

          {/* Spacer for desktop search to be centered if needed, but here it's on the right */}
          <div className="flex-grow hidden lg:block"></div>

          {/* Cart & Checkout */}
          <div className="flex items-center gap-4">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2">
              <div className="relative flex-grow w-32 lg:w-auto">
                <input
                  type="text"
                  placeholder="Пошук..."
                  className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white transition outline-none"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </form>

            <div 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <ShoppingCart className="text-slate-900 dark:text-white group-hover:text-blue-600 transition" size={24} />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-sm text-right leading-tight">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Кошик</div>
                <div className="font-bold text-slate-900 dark:text-white">{isMounted ? formatPrice(displayCartTotal) : formatPrice(0)}</div>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="hidden sm:block bg-blue-600 hover:bg-blue-800 text-white px-5 py-2 rounded-md font-medium transition text-sm shadow-sm whitespace-nowrap"
            >
              Оформити
            </Link>

            {/* Mobile Search Toggle */}
            <button
              className="md:hidden text-slate-900 dark:text-white"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <Search size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="md:hidden absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-900 z-20 flex items-center px-4">
            <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileSearchOpen(false); }} className="flex items-center gap-2 w-full">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Пошук..."
                  className="w-full bg-gray-100 dark:bg-slate-800 rounded-lg py-3 px-4 pl-10 text-slate-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-slate-900 dark:text-white"
              >
                <X size={24} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
