import Image from 'next/image';
import { products, categories, subcategories } from '@/data/mockData';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  
  if (!product) {
    notFound();
  }

  const subcategory = subcategories.find(s => s.id === product.subcategoryId);
  const category = categories.find(c => c.id === subcategory?.categoryId);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <Breadcrumbs items={[
        { label: category?.name || '', href: `/category/${category?.id}` },
        { label: subcategory?.name || '', href: `/subcategory/${subcategory?.id}` },
        { label: product.name }
      ]} />

      <div className="grid grid-standard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Product Image */}
        <div className="card" style={{ background: 'white', padding: '2rem', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        </div>

        {/* Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-text)' }}>{product.name}</h1>
          
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-accent)' }}>
            {product.price.toLocaleString()} UAH
          </div>

          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 0' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-text)' }}>Опис</h3>
            <p style={{ color: '#555', lineHeight: '1.6' }}>{product.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn" style={{ flex: 1, padding: '1.25rem' }}>
              Додати в кошик
            </button>
            <button className="btn" style={{ flex: 1, padding: '1.25rem', background: 'var(--secondary-dark)' }}>
              Купити зараз
            </button>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              ✓ В наявності<br />
              ✓ Доставка Новою Поштою (1-2 дні)<br />
              ✓ Гарантія якості
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
