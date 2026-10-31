'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MarketplaceProductCard } from '@/components/customer/marketplace/MarketplaceProductCard';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    stock: number;
    costPrice?: number | null;
    images?: string[];
    category: { name: string };
  };
}

export default function CustomerWishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading wishlist..." />;
  }

  return (
    <>
      <div className="store-panel px-4 sm:px-5 py-4 mb-4">
        <h1 className="text-xl font-bold text-slate-900">My Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">{items.length} saved item(s)</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap ♡ on any product while browsing to save it here."
          actionLabel="Browse products"
          actionHref="/customer/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item) => {
            const p = item.product;
            return (
              <div key={item.id} className="relative">
                <MarketplaceProductCard
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  stock={p.stock}
                  categoryName={p.category.name}
                  costPrice={p.costPrice != null ? Number(p.costPrice) : null}
                  images={p.images}
                />
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/wishlist/${p.id}`, { method: 'DELETE' });
                    refresh();
                  }}
                  className="absolute bottom-14 right-3 z-10 text-[10px] font-semibold text-rose-600 hover:underline bg-white/90 px-1"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/customer/cart')}
            className="rounded-sm bg-[#fb641b] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#e85a17]"
          >
            Go to cart
          </button>
        </div>
      )}
    </>
  );
}
