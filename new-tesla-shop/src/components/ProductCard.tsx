'use client';

import Image from 'next/image';
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
      <div className="card-image" style={{ position: 'relative' }}>
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>
      <div className="card-content">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatPrice(product.price)}</span>
          <button 
            onClick={() => addToCart(product)} 
            className="btn"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
