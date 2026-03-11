'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import Sidebar from './Sidebar';

const Header = () => {
  const { totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header style={{ background: 'var(--secondary-dark)', color: 'white', padding: '1rem 0', marginBottom: '1rem' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Burger Menu Button (Both Desktop and Mobile) */}
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'white', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span className="desktop-only" style={{ fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Меню
            </span>
          </button>

          {/* Logo */}
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px', color: 'white' }}>
            TESLA PARTS UA
          </Link>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Currency Switcher */}
          <div className="currency-switcher" style={{ margin: 0 }}>
            <button 
              className={`currency-btn ${currency === 'UAH' ? 'active' : ''}`}
              onClick={() => setCurrency('UAH')}
              style={{ 
                borderColor: '#444', 
                color: currency === 'UAH' ? 'white' : '#888',
                backgroundColor: currency === 'UAH' ? 'var(--primary-accent)' : 'transparent' 
              }}
            >
              UAH
            </button>
            <button 
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
              style={{ 
                borderColor: '#444', 
                color: currency === 'USD' ? 'white' : '#888',
                backgroundColor: currency === 'USD' ? 'var(--primary-accent)' : 'transparent'
              }}
            >
              USD
            </button>
          </div>

          {/* Cart Icon */}
          <Link href="/checkout" style={{ position: 'relative', color: 'var(--primary-accent)' }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'white',
                color: 'var(--secondary-dark)',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
