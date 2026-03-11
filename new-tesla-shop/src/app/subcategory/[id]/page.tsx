import { subcategories, products, categories } from '@/data/mockData';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubcategoryPage({ params }: Props) {
  const { id } = await params;
  const subcategory = subcategories.find((s) => s.id === id);
  
  if (!subcategory) {
    notFound();
  }

  const category = categories.find(c => c.id === subcategory.categoryId);
  const subcategoryProducts = products.filter((p) => p.subcategoryId === id);

  return (
    <div>
      <Breadcrumbs items={[
        { label: category?.name || '', href: `/category/${category?.id}` },
        { label: subcategory.name }
      ]} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>{subcategory.name}</h1>
      </div>
      
      {subcategoryProducts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '4rem' }}>
          На жаль, у цій підкатегорії поки немає товарів.
        </p>
      ) : (
        <div className="grid grid-2 grid-3">
          {subcategoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
