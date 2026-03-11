import Image from 'next/image';
import { categories, subcategories } from '@/data/mockData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = categories.find((c) => c.id === id);
  
  if (!category) {
    notFound();
  }

  const categorySubcategories = subcategories.filter((s) => s.categoryId === id);

  return (
    <div>
      <Breadcrumbs items={[{ label: category.name }]} />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary-text)' }}>{category.name}: Підкатегорії</h1>
      </div>
      
      <div className="grid grid-standard">
        {categorySubcategories.map((sub) => (
          <Link key={sub.id} href={`/subcategory/${sub.id}`} className="card">
            <div className="card-image" style={{ position: 'relative', height: '400px', background: 'white' }}>
              <Image 
                src={sub.image} 
                alt={sub.name} 
                fill 
                style={{ objectFit: 'contain', padding: '1rem' }}
                unoptimized
              />
            </div>
            <div className="card-content" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', textAlign: 'center', color: 'var(--primary-text)' }}>{sub.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
