'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { X, ChevronDown, ChevronRight } from 'lucide-react';

const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-');

const Sidebar: React.FC = () => {
  const { categories, isSidebarOpen, setIsSidebarOpen } = useApp();
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const sortedCategories = [...categories].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const newExpanded: Record<number, boolean> = {};
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
    setExpandedCategories(prev => {
      if (prev[id]) {
        return {};
      }
      return { [id]: true };
    });
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-end border-b border-gray-100 p-4 dark:border-slate-700 lg:hidden">
        <button onClick={closeSidebar} className="p-2 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:pt-8">
        <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400">
          Категорії запчастин
        </h2>
        <nav className="space-y-1">
          {sortedCategories.map((category) => {
            const categorySlug = slugify(category.name);
            const isActive = pathname.startsWith(`/category/${categorySlug}`);
            const isExpanded = !!expandedCategories[category.id];
            const hasSubcategories = !!category.subcategories && category.subcategories.length > 0;

            return (
              <div key={category.id} className="mb-2">
                <div className="group flex items-center">
                  <Link
                    href={`/category/${categorySlug}`}
                    onClick={closeSidebar}
                    className={`
                      flex flex-grow items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-gray-50 hover:text-blue-600 dark:text-slate-200 dark:hover:bg-slate-700/50 dark:hover:text-blue-400'}
                    `}
                  >
                    <span>{category.name}</span>
                  </Link>
                  {hasSubcategories && (
                    <button
                      onClick={(e) => toggleCategory(e, category.id)}
                      className={`
                        ml-1 rounded-md p-2 transition-colors
                        ${isActive
                          ? 'text-white/80 hover:bg-white/10 hover:text-white'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-slate-700/50 dark:hover:text-blue-400'}
                      `}
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  )}
                </div>

                {hasSubcategories && isExpanded && (
                  <div className="ml-4 mt-2 space-y-1 overflow-hidden border-l-2 border-blue-100 pl-3 transition-all duration-300 dark:border-slate-700">
                    {category.subcategories!.map((sub) => {
                      const subUrl = `/category/${categorySlug}/sub/${sub.id}`;
                      const isSubActive = pathname === subUrl;
                      return (
                        <Link
                          key={sub.id}
                          href={subUrl}
                          onClick={closeSidebar}
                          className={`
                            block rounded-md px-3 py-2 text-xs transition-colors
                            ${isSubActive
                              ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'text-slate-500 hover:bg-gray-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-400'}
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

      <div className="mt-auto shrink-0 border-t border-gray-100 bg-gray-50/50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
        <p>© 2026 TeslaFix</p>
      </div>
    </>
  );

  return (
    <>
      <div
        className={`
          fixed inset-0 z-[66] transition-opacity duration-300 lg:hidden
          ${isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
        `}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />

        <aside
          className={`
            absolute inset-y-0 left-0 z-[67] flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-72 max-w-[calc(100vw-3rem)]
            flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-800
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {sidebarContent}
        </aside>
      </div>

      <aside className="hidden lg:sticky lg:top-[96px] lg:z-50 lg:flex lg:h-[calc(100vh-96px)] lg:min-h-[calc(100vh-96px)] lg:max-h-[calc(100vh-96px)] lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:transition-colors lg:dark:border-slate-700 lg:dark:bg-slate-800">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
