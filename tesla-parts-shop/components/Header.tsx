'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, Menu, X, ChevronDown, Sun, Moon, Phone, MessageSquare, Send, User, LogOut, ShoppingBag, LogIn, UserPlus } from 'lucide-react';
import { Currency } from '../types';
import ShopLogo from './ShopLogo';
import Link from 'next/link';
import { formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram, faWhatsapp, faViber } from '@fortawesome/free-brands-svg-icons';

const DEFAULT_HEADER_PHONE = '+380 98 919 6969';

const Header: React.FC = () => {
  const {
    cartCount,
    cartTotalUSD,
    currency,
    uahPerUsd,
    categories,
    setCurrency,
    setIsCartOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    toggleTheme,
    socialLinks,
    contactInfo,
    headerPages,
    isCustomerLoggedIn,
    logoutCustomer,
  } = useApp();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pagesDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target as Node)) {
        setIsPagesDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
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

  const handleLogout = () => {
    logoutCustomer();
    setShowLogoutConfirm(false);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const displayCartTotal = (() => {
    const rate = uahPerUsd > 0 ? uahPerUsd : 1;
    return currency === Currency.UAH ? cartTotalUSD * rate : cartTotalUSD;
  })();

  const displayPhone = contactInfo.phone || DEFAULT_HEADER_PHONE;
  const phoneHref = `tel:${displayPhone.replace(/[^\d+]/g, '')}`;

  return (
    <header className="sticky top-0 z-[60] shadow-md transition-colors">
      {/* Top Row: Utilities & Info - BLUE (Hidden in mobile landscape to save space) */}
      <div className="bg-blue-600 text-white text-xs py-2 px-4 transition-colors max-md:landscape:hidden">
        <div className="container mx-auto flex flex-row w-full justify-between items-center gap-2 md:gap-4">
          <nav className="hidden md:flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start">
            {headerPages.filter(page => page.is_published).map((page) => (
              <Link
                key={page.slug}
                href={`/info/${page.slug}`}
                className="hover:text-blue-100 transition"
              >
                {page.title}
              </Link>
            ))}
            <Link href="/feedback" className="hover:text-blue-100 transition">
              Відгуки
            </Link>
          </nav>

          <div className="relative md:hidden" ref={pagesDropdownRef}>
            <button onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)} className="flex items-center gap-1 hover:text-blue-100 transition font-medium">
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
                <Link
                  href="/feedback"
                  onClick={() => setIsPagesDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Відгуки
                </Link>
              </div>
            )}
          </div>

          {isMounted && (
            <a
              href={phoneHref}
              className="md:hidden ml-auto min-w-0 max-w-[8.5rem] text-right text-[11px] font-semibold whitespace-nowrap text-white/95 hover:text-white transition px-1"
              title={displayPhone}
            >
              <span className="block truncate">{displayPhone}</span>
            </a>
          )}

          <div className="flex items-center gap-4">
             {isMounted && (
            <a
              href={phoneHref}
              className="hidden md:inline-flex items-center gap-2 text-base font-semibold text-white/95 hover:text-white transition whitespace-nowrap"
              title={displayPhone}
            >
              <span>{displayPhone}</span>
            </a>
          )}

            {isMounted && socialLinks.telegram && (
              <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="hidden md:flex hover:text-blue-100 transition p-1.5 bg-white/10 rounded-full" title="Telegram">
                <FontAwesomeIcon icon={faTelegram} size="lg" className="text-white" />
              </a>
            )}
            {isMounted && socialLinks.viber && (
              <a href={socialLinks.viber} target="_blank" rel="noopener noreferrer" className="hidden md:flex hover:text-blue-100 transition p-1.5 bg-white/10 rounded-full" title="Viber">
                <FontAwesomeIcon icon={faViber} size="lg" className="text-white" />
              </a>
            )}
            {isMounted && socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hidden md:flex hover:text-blue-100 transition p-1.5 bg-white/10 rounded-full" title="WhatsApp">
                <FontAwesomeIcon icon={faWhatsapp} size="lg" className="text-white" />
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors ml-1"
              title={isMounted ? (theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему') : ''}
            >
              {isMounted && (theme === 'light' ? <Moon size={16} /> : <Sun size={16} />)}
            </button>

            <div className="border-l border-white/20 pl-4 flex gap-2">
              {Object.values(Currency).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`font-semibold ${currency === cur ? 'text-white border-b-2 border-white' : 'text-blue-100 hover:text-white'}`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Logo, Search, Cart - WHITE/DARK */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors relative">
        <div className="px-4 py-0.5 md:py-1 min-h-16 lg:min-h-[64px] flex items-center justify-between gap-4">

          {/* Burger & Logo Area - Align with Sidebar width on desktop if possible */}
          <div className="flex items-center gap-2 lg:gap-4 lg:w-64">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-900 dark:text-white hover:text-blue-600 transition flex items-center justify-center"
              aria-label={isMounted ? (isSidebarOpen ? "Закрити меню" : "Відкрити меню") : "Меню"}
            >
              {isMounted ? (isSidebarOpen ? <X size={28} /> : <Menu size={28} />) : <Menu size={28} />}
            </button>

            {/* Logo - Moved to the left */}
            <div className="flex-shrink-0">
              <ShopLogo compact />
            </div>
          </div>

          {/* Spacer for desktop search */}
          <div className="flex-grow hidden lg:block"></div>

          {/* Cart & Checkout */}
          <div className="flex items-center gap-4 lg:pr-4">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2">
              <div className="relative flex-grow w-32 lg:w-64">
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

            {/* Profile Button / Dropdown */}
            {isMounted && (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="text-slate-900 dark:text-white hover:text-blue-600 transition flex items-center animate-in fade-in"
                  title={isCustomerLoggedIn ? "Профіль" : "Увійти / Реєстрація"}
                >
                  <User size={24} />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 shadow-lg rounded-md overflow-hidden z-[70] border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    {isCustomerLoggedIn ? (
                      <>
                        <Link 
                          href="/profile" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                        >
                          <User size={18} className="text-blue-600" />
                          <span>Мій профіль</span>
                        </Link>
                        <Link 
                          href="/profile?tab=orders" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                        >
                          <ShoppingBag size={18} className="text-blue-600" />
                          <span>Мої замовлення</span>
                        </Link>
                        <div className="border-t border-gray-100 dark:border-slate-700"></div>
                        <button 
                          onClick={() => {
                            setShowLogoutConfirm(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                        >
                          <LogOut size={18} />
                          <span>Вийти</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/login" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                        >
                          <LogIn size={18} className="text-blue-600" />
                          <span>Увійти</span>
                        </Link>
                        <Link 
                          href="/register" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
                        >
                          <UserPlus size={18} className="text-blue-600" />
                          <span>Реєстрація</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <Link
              href="/checkout"
              className="hidden sm:block bg-blue-600 hover:bg-blue-800 text-white px-5 py-2 rounded-md font-bold transition text-sm shadow-md whitespace-nowrap"
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Вийти з акаунта?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Ви впевнені, що хочете вийти зі свого акаунта?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  Скасувати
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md shadow-red-200 dark:shadow-none"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
