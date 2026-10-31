'use client';

import { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/customer/marketplace/HeroCarousel';
import { CategoryStrip } from '@/components/customer/marketplace/CategoryStrip';
import { DealBanners } from '@/components/customer/marketplace/DealBanners';
import { ProductRow } from '@/components/customer/marketplace/ProductRow';
import { MarketplaceProductCard } from '@/components/customer/marketplace/MarketplaceProductCard';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { useStoreConfig } from '@/contexts/StoreConfigContext';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  costPrice?: number | null;
  images?: string[];
  category: { id: string; name: string };
};

export default function CustomerDashboard() {
  const { categories } = useStoreConfig();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((p) => setProducts(p.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading..." />;

  const deals = products.slice(0, 10);

  const categoryRows = categories
    .map((cat) => ({
      cat,
      items: products.filter((p) => p.category.id === cat.id).slice(0, 8),
    }))
    .filter((row) => row.items.length > 0)
    .slice(0, 4);

  return (
    <>
      <HeroCarousel />
      <CategoryStrip categories={categories} fullBleed />
      <DealBanners />
      <ProductRow title="Deals of the Day" products={deals} viewAllHref="/customer/products" />
      {categoryRows.map(({ cat, items }) => (
        <ProductRow
          key={cat.id}
          title={`Top in ${cat.name}`}
          viewAllHref={`/customer/products?category=${cat.id}`}
          products={items}
        />
      ))}
      <section className="store-panel p-4 sm:p-5 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          Explore all products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.slice(0, 10).map((p) => (
            <MarketplaceProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              stock={p.stock}
              categoryName={p.category.name}
              costPrice={p.costPrice != null ? Number(p.costPrice) : null}
              images={p.images}
              compact
            />
          ))}
        </div>
      </section>
    </>
  );
}
