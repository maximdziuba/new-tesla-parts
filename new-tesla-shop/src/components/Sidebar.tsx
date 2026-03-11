'use client';

import Link from 'next/link';
import { categories, subcategories } from '@/data/mockData';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: Props) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const infoLinks = [
    { label: 'Про нас', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Політика конфіденційності', href: '/privacy' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>МЕНЮ</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <div>
            <h3 style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '1px', marginBottom: '1rem' }}>КАТЕГОРІЇ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categories.map(category => (
                <div key={category.id}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Link href={`/category/${category.id}`} className="sidebar-link" onClick={onClose}>
                      {category.name}
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {expandedCategories.includes(category.id) ? '▲' : '▼'}
                    </span>
                  </div>
                  
                  {expandedCategories.includes(category.id) && (
                    <div className="sidebar-category-list">
                      {subcategories
                        .filter(s => s.categoryId === category.id)
                        .map(sub => (
                          <Link 
                            key={sub.id} 
                            href={`/subcategory/${sub.id}`} 
                            className="sidebar-subcategory-link"
                            onClick={onClose}
                          >
                            {sub.name}
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '1px', marginBottom: '1rem' }}>ІНФОРМАЦІЯ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {infoLinks.map(link => (
                <Link key={link.href} href={link.href} className="sidebar-link" onClick={onClose}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
