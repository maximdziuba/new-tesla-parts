'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="card">
      <Link href={`/product/${product.id}`} style={{ display: 'block' }}>
        <div className="card-image" style={{ position: 'relative' }}>
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            style={{ objectFit: 'contain', padding: '1rem', background: 'white' }}
            unoptimized
          />
          {/* Status indicator in Royal Electric Blue */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'var(--primary-accent)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            В наявності
          </div>
        </div>
      </Link>
      <div className="card-content">
        <Link href={`/product/${product.id}`}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-text)', height: '2.8rem', overflow: 'hidden' }}>
            {product.name}
          </h3>
        </Link>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', height: '2rem', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-text)' }}>{formatPrice(product.price)}</span>
          <button 
            onClick={() => addToCart(product)} 
            className="btn"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100%' }}
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
