'use client';

import { dedupeCategories } from '@/lib/product-display';

type Category = { id: string; name: string; icon?: string };

const inputClass =
  'w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

export function ProductFilters({
  categories,
  filterCategory,
  minPrice,
  maxPrice,
  inStockOnly,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onClearAll,
  variant = 'sidebar',
}: {
  categories: Category[];
  filterCategory: string;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  onCategoryChange: (id: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onInStockChange: (v: boolean) => void;
  onClearAll: () => void;
  variant?: 'sidebar' | 'inline';
}) {
  const uniqueCategories = dedupeCategories(categories);

  const inner = (
    <>
      <div className="px-4 py-3.5 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Refine your search</p>
      </div>

      <div className="p-4 space-y-5">
          <section>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Category
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => onCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !filterCategory
                      ? 'bg-[#2563eb]/10 text-[#2563eb] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All products
                </button>
              </li>
              {uniqueCategories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(c.id)}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      filterCategory === c.id
                        ? 'bg-[#2563eb]/10 text-[#2563eb] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-5 w-5 shrink-0 flex items-center justify-center overflow-hidden rounded">
                      {c.icon && (c.icon.startsWith('/') || c.icon.startsWith('http')) ? (
                        <img src={c.icon} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <span className="text-base leading-none">{c.icon || '🛍️'}</span>
                      )}
                    </span>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Price
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className={inputClass}
              />
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                In stock only
              </span>
            </label>
          </section>

          <button
            type="button"
            onClick={onClearAll}
            className="w-full pt-2 text-sm font-semibold text-[#2563eb] hover:underline text-left"
          >
            Clear all filters
          </button>
        </div>
    </>
  );

  if (variant === 'inline') {
    return <div>{inner}</div>;
  }

  return (
    <aside className="store-panel hidden lg:block w-[240px] shrink-0">
      <div className="sticky top-[128px]">{inner}</div>
    </aside>
  );
}
