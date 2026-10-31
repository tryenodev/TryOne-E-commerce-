'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/customer/marketplace/Breadcrumbs';
import { CategoryStrip } from '@/components/customer/marketplace/CategoryStrip';
import { MarketplaceProductCard } from '@/components/customer/marketplace/MarketplaceProductCard';
import { ProductFilters } from '@/components/customer/marketplace/ProductFilters';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { useStoreConfig } from '@/contexts/StoreConfigContext';
import { getDiscountSortValue } from '@/lib/marketplace';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  costPrice?: number | null;
  images?: string[];
  category: { id: string; name: string };
}

export default function CustomerProductsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading products..." />}>
      <CustomerProductsContent />
    </Suspense>
  );
}

function CustomerProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useStoreConfig();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'discount'>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
    setFilterCategory(searchParams.get('category') ?? '');
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((productsData) => setProducts(productsData.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const activeCategoryName = categories.find((c) => c.id === filterCategory)?.name;

  const syncUrl = useCallback(
    (q: string, cat: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      const qs = params.toString();
      router.replace(qs ? `/customer/products?${qs}` : '/customer/products', { scroll: false });
    },
    [router]
  );

  const applyCategory = (catId: string) => {
    setFilterCategory(catId);
    syncUrl(searchQuery, catId);
    setMobileFiltersOpen(false);
  };

  const clearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    applyCategory('');
    setSearchQuery('');
    syncUrl('', '');
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.name.toLowerCase().includes(q) ||
        (product.description?.toLowerCase().includes(q) ?? false);
      const matchesCategory = !filterCategory || product.category.id === filterCategory;
      const price = Number(product.price);
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;
      const matchesStock = !inStockOnly || product.stock > 0;
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    if (sortBy === 'price-low') list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-high') list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === 'discount') {
      list = [...list].sort(
        (a, b) =>
          getDiscountSortValue(Number(b.price), b.costPrice) -
          getDiscountSortValue(Number(a.price), a.costPrice)
      );
    }

    return list;
  }, [products, searchQuery, filterCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCategoryName
      ? activeCategoryName
      : 'All products';

  if (loading) return <LoadingScreen message="Loading products..." />;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/customer/dashboard' },
          { label: 'Products', href: '/customer/products' },
          ...(activeCategoryName ? [{ label: activeCategoryName }] : searchQuery ? [{ label: searchQuery }] : []),
        ]}
      />

      <div className="store-panel mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-4 sm:px-5 pt-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((o) => !o)}
              className="lg:hidden rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 min-w-[160px] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Discount</option>
            </select>
          </div>
        </div>
        <div className="px-2 sm:px-3 pb-3 border-t border-slate-100">
          <CategoryStrip
            categories={categories}
            activeId={filterCategory}
            onSelect={applyCategory}
          />
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="lg:hidden store-panel mb-4">
          <ProductFilters
            variant="inline"
            categories={categories}
            filterCategory={filterCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStockOnly={inStockOnly}
            onCategoryChange={applyCategory}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onInStockChange={setInStockOnly}
            onClearAll={clearAll}
          />
        </div>
      )}

      <div className="flex gap-4">
        <ProductFilters
          categories={categories}
          filterCategory={filterCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          inStockOnly={inStockOnly}
          onCategoryChange={applyCategory}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onInStockChange={setInStockOnly}
          onClearAll={clearAll}
        />

        <div className="flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting filters or search with different keywords."
              actionLabel="Clear filters"
              onAction={clearAll}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <MarketplaceProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  stock={product.stock}
                  categoryName={product.category.name}
                  costPrice={product.costPrice != null ? Number(product.costPrice) : null}
                  images={product.images}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
