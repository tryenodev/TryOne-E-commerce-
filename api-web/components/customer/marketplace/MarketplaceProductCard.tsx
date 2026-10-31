'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProductMedia } from '@/components/customer/marketplace/ProductMedia';
import { useCart } from '@/contexts/CartContext';
import { useShopToast } from '@/contexts/ShopToastContext';
import { formatINR } from '@/lib/format';
import { getDiscountPercent, getDisplayMrp, getProductRating } from '@/lib/marketplace';

type Props = {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  costPrice?: number | null;
  images?: string[] | null;
  compact?: boolean;
};

export function MarketplaceProductCard({
  id,
  name,
  price,
  stock,
  categoryName,
  costPrice,
  images,
  compact = false,
}: Props) {
  const { addToCart } = useCart();
  const { showToast } = useShopToast();
  const [wishlisted, setWishlisted] = useState(false);

  const mrp = getDisplayMrp(price, costPrice);
  const discount = getDiscountPercent(price, mrp);
  const { rating } = getProductRating(id);
  const inStock = stock > 0;
  const href = `/customer/products/${id}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addToCart({
      id,
      name,
      price: Number(price),
      quantity: 1,
      stock,
      image: images?.[0],
    });
    showToast('Added to cart');
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wishlisted) {
        const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setWishlisted(false);
          showToast('Removed from wishlist');
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        });
        if (res.ok) {
          setWishlisted(true);
          showToast('Saved to wishlist');
        }
      }
    } catch {
      showToast('Could not update wishlist', 'error');
    }
  };

  return (
    <article className="store-product-card group relative flex flex-col h-full bg-white rounded-lg border border-slate-200/80 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-200">
      <button
        type="button"
        onClick={handleWishlist}
        className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm border transition-colors ${
          wishlisted
            ? 'bg-rose-50 border-rose-200 text-rose-500'
            : 'bg-white/95 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100'
        }`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      <Link href={href} className="flex flex-col flex-1">
        <div className="relative border-b border-slate-50">
          <ProductMedia
            name={name}
            categoryName={categoryName}
            images={images}
            className={`w-full ${compact ? 'aspect-[4/5]' : 'aspect-square'}`}
            size={compact ? 'sm' : 'md'}
          />
          {!inStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/85 text-xs font-bold uppercase tracking-wide text-slate-600">
              Sold out
            </span>
          )}
          {discount > 0 && inStock && (
            <span className="absolute top-2.5 left-2.5 rounded-sm bg-[#388e3c] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {discount}% off
            </span>
          )}
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-3.5">
          <h3 className="text-sm text-slate-800 line-clamp-2 leading-snug font-medium group-hover:text-[#2563eb] min-h-[2.5rem]">
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#388e3c] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {rating}
              <span className="opacity-90">★</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#2563eb]">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              </svg>
              Assured
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {formatINR(price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {formatINR(mrp)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {!compact && inStock && (
        <div className="px-3 pb-3 pt-0 mt-auto">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full rounded-md bg-[#fb641b] hover:bg-[#e85a17] text-white py-2.5 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors"
          >
            Add to cart
          </button>
        </div>
      )}
    </article>
  );
}
