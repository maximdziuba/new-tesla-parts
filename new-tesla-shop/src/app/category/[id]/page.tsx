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
        <h1 style={{ textAlign: 'center' }}>{category.name}: Підкатегорії</h1>
      </div>
      
      <div className="grid grid-2 grid-3">
        {categorySubcategories.map((sub) => (
          <Link key={sub.id} href={`/subcategory/${sub.id}`} className="card">
            <div className="card-image" style={{ position: 'relative' }}>
              <Image 
                src={sub.image} 
                alt={sub.name} 
                fill 
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>
            <div className="card-content">
              <h2 style={{ fontSize: '1.1rem', textAlign: 'center' }}>{sub.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
