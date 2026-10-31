'use client';

import Link from 'next/link';
import { dedupeCategories } from '@/lib/product-display';

type Category = { id: string; name: string; icon?: string };

export function CategoryStrip({
  categories,
  activeId,
  onSelect,
  fullBleed = false,
}: {
  categories: Category[];
  activeId?: string;
  onSelect?: (id: string) => void;
  fullBleed?: boolean;
}) {
  const unique = dedupeCategories(categories);
  const wrapClass = fullBleed ? 'store-panel py-4 px-3 mb-3' : 'pt-1';

  const items = [
    { id: '', name: 'Top Offers', icon: '🏷️' },
    ...unique.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '🛍️',
    })),
  ];

  return (
    <div className={wrapClass}>
      <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-1 scrollbar-hide">
        {items.map((cat) => {
          const active = activeId === cat.id;
          const content = (
            <>
              <span
                className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-2xl bg-gradient-to-br from-slate-50 to-white border-2 transition-all duration-200 ${
                  active
                    ? 'border-[#2563eb] shadow-md shadow-blue-100 scale-105'
                    : 'border-slate-100 hover:border-[#2563eb]/40 hover:shadow-sm'
                }`}
              >
                {cat.icon}
              </span>
              <span
                className={`text-[11px] sm:text-xs text-center max-w-[76px] leading-tight mt-2 line-clamp-2 ${
                  active ? 'font-bold text-[#2563eb]' : 'font-medium text-slate-600'
                }`}
              >
                {cat.name}
              </span>
            </>
          );

          const className =
            'shrink-0 flex flex-col items-center min-w-[76px] sm:min-w-[84px]';

          if (onSelect) {
            return (
              <button
                key={cat.id || 'all'}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={cat.id || 'all'}
              href={cat.id ? `/customer/products?category=${cat.id}` : '/customer/products'}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
