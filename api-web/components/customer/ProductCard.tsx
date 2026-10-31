'use client';

import Link from 'next/link';
import { formatINR } from '@/lib/format';
import { IconHeart, IconPackage } from '@/components/customer/icons';

type ProductCardProps = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryName: string;
  onWishlist?: (id: string) => void;
};

export function ProductCard({
  id,
  name,
  description,
  price,
  stock,
  categoryName,
  onWishlist,
}: ProductCardProps) {
  const inStock = stock > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-emerald-50/80">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-emerald-600 shadow-inner ring-1 ring-slate-200/60 backdrop-blur-sm">
            <IconPackage className="h-8 w-8" />
          </div>
        </div>
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm ring-1 ring-slate-200/60">
          {categoryName}
        </span>
        {!inStock && (
          <span className="absolute right-3 top-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
          {name}
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 flex-1">
          {description || 'Quality product from our catalog.'}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{formatINR(price)}</p>
            <p className={`text-xs font-medium ${inStock ? 'text-emerald-600' : 'text-rose-600'}`}>
              {inStock ? `${stock} available` : 'Out of stock'}
            </p>
          </div>
          <div className="flex gap-2">
            {onWishlist && (
              <button
                type="button"
                onClick={() => onWishlist(id)}
                title="Add to wishlist"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <IconHeart className="h-4 w-4" />
              </button>
            )}
            <Link
              href={`/products/${id}`}
              className={`inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                inStock
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-400 pointer-events-none'
              }`}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
