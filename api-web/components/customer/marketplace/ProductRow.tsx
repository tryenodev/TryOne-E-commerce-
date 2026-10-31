'use client';

import Link from 'next/link';
import { MarketplaceProductCard } from '@/components/customer/marketplace/MarketplaceProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  costPrice?: number | null;
  images?: string[];
  category: { name: string };
};

export function ProductRow({
  title,
  viewAllHref = '/customer/products',
  products,
}: {
  title: string;
  viewAllHref?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="store-panel mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-semibold text-[#2563eb] hover:underline">
          View All
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide p-3 sm:p-4">
        {products.map((p) => (
          <div key={p.id} className="shrink-0 w-[168px] sm:w-[200px]">
            <MarketplaceProductCard
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              stock={p.stock}
              categoryName={p.category.name}
              costPrice={p.costPrice != null ? Number(p.costPrice) : null}
              images={p.images}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
}
