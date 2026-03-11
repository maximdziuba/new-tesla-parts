import Image from 'next/image';
import Link from 'next/link';
import { categories, products } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  // Mock "popular" products - just taking the first 4
  const popularProducts = products.slice(0, 4);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Categories Hero Section */}
      <section style={{ marginBottom: '4rem' }}>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--primary-text)' }}>Категорії Tesla</h1>
        <div className="grid grid-standard" style={{ gap: '1.5rem' }}>
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.id}`} 
              className="card" 
              style={{ 
                position: 'relative', 
                height: '300px', 
                border: 'none',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <Image 
                src={category.image} 
                alt={category.name} 
                fill 
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '2rem',
                transition: 'background 0.3s'
              }}>
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{category.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-text)' }}>Популярні товари</h2>
          <span style={{ color: 'var(--primary-accent)', fontWeight: '500' }}>Дивитись всі →</span>
        </div>
        <div className="grid grid-products">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
