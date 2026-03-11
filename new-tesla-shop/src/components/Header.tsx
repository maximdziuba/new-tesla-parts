'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

const Header = () => {
  const { totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);

  const infoLinks = [
    { label: 'Про нас', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Політика конфіденційності', href: '/privacy' }
  ];

  return (
    <header style={{ background: 'var(--dark-navy)', color: 'white', padding: '1rem 0', marginBottom: '1rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px', color: 'white' }}>
          TESLA PARTS UA
        </Link>

        {/* Desktop Info Links (Middle) */}
        <nav className="desktop-only" style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          {infoLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ color: '#ccc' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Currency Switcher */}
          <div className="currency-switcher" style={{ margin: 0 }}>
            <button 
              className={`currency-btn ${currency === 'UAH' ? 'active' : ''}`}
              onClick={() => setCurrency('UAH')}
              style={{ borderColor: '#444', color: currency === 'UAH' ? 'white' : '#888' }}
            >
              UAH
            </button>
            <button 
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
              style={{ borderColor: '#444', color: currency === 'USD' ? 'white' : '#888' }}
            >
              USD
            </button>
          </div>

          {/* Cart Icon */}
          <Link href="/checkout" style={{ position: 'relative', color: 'white' }}>
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
                background: '#4169E1',
                color: 'white',
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

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', padding: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mobile-only" style={{ background: '#12192b', padding: '1rem', borderTop: '1px solid #222' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            {infoLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
