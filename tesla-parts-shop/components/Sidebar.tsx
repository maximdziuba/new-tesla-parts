'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import ShopLogo from './ShopLogo';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Sidebar: React.FC = () => {
  const { categories, isSidebarOpen, setIsSidebarOpen } = useApp();
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const sortedCategories = [...categories].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));

  const closeSidebar = () => setIsSidebarOpen(false);

  // Initialize expanded state based on pathname
  useEffect(() => {
    const newExpanded: Record<number, boolean> = { ...expandedCategories };
    categories.forEach(cat => {
      const categorySlug = slugify(cat.name);
      if (pathname.startsWith(`/category/${categorySlug}`)) {
        newExpanded[cat.id] = true;
      }
    });
    setExpandedCategories(newExpanded);
  }, [categories, pathname]);

  const toggleCategory = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky inset-y-0 left-0 z-[66] lg:z-50
        lg:top-[112px] lg:h-[calc(100vh-112px)]
        w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col transition-colors shadow-2xl lg:shadow-none
      `}>
        {/* Sidebar Header - Mobile Close Button Only */}
        <div className="flex items-center justify-end p-4 lg:hidden border-b border-gray-100 dark:border-slate-700">
          <button onClick={closeSidebar} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-grow overflow-y-auto py-6 px-4 lg:pt-8">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-4 px-3">
            Категорії запчастин
          </h2>
          <nav className="space-y-1">
            {sortedCategories.map((category) => {
              const categorySlug = slugify(category.name);
              const isActive = pathname.startsWith(`/category/${categorySlug}`);
              const isExpanded = !!expandedCategories[category.id];
              const hasSubcategories = category.subcategories && category.subcategories.length > 0;
              
              return (
                <div key={category.id} className="mb-2">
                  <div className="flex items-center group">
                    <Link
                      href={`/category/${categorySlug}`}
                      onClick={closeSidebar}
                      className={`
                        flex-grow flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400'}
                      `}
                    >
                      <span>{category.name}</span>
                    </Link>
                    {hasSubcategories && (
                      <button
                        onClick={(e) => toggleCategory(e, category.id)}
                        className={`
                          p-2 ml-1 rounded-md transition-colors
                          ${isActive 
                            ? 'text-white/80 hover:text-white hover:bg-white/10' 
                            : 'text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                        `}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  {hasSubcategories && isExpanded && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-100 dark:border-slate-700 pl-3 transition-all duration-300 overflow-hidden">
                      {category.subcategories!.map((sub) => {
                        const subUrl = `/category/${categorySlug}/sub/${sub.id}`;
                        const isSubActive = pathname === subUrl;
                        return (
                          <Link
                            key={sub.id}
                            href={subUrl}
                            onClick={closeSidebar}
                            className={`
                              block px-3 py-2 text-xs rounded-md transition-colors
                              ${isSubActive
                                ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}
                            `}
                          >
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-700 text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-widest bg-gray-50/50 dark:bg-slate-800/50">
            <p>© 2026 Tesla Parts Shop</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
