'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { STATUS_FILTER_ALL } from '@/lib/enums';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatINR } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string | null;
  images?: string[];
  category: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  isVisible?: boolean;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<typeof STATUS_FILTER_ALL | 'active' | 'inactive'>(STATUS_FILTER_ALL);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '10',
    categoryId: '',
    sku: '',
    imageUrl: '',
    isActive: true,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products ?? []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch products' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories ?? []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const seedSampleProducts = async (categoryId?: string) => {
    const label = categoryId
      ? categories.find((c) => c.id === categoryId)?.name
      : 'all categories';
    if (!confirm(`Add 3 sample products for ${label}? (Skips if SKU already exists)`)) return;

    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/store/seed-sample-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryId ? { categoryId } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Added ${data.created} products (${data.skipped} skipped). Customers can see them on the store now.`,
        });
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add samples' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({
          type: 'success',
          text: `“${data.product?.name ?? formData.name}” added — visible on customer store (${data.product?.category?.name})`,
        });
        setShowAddForm(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          costPrice: '',
          stock: '10',
          categoryId: '',
          sku: '',
          imageUrl: '',
          isActive: true,
        });
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to add product' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (product: Product) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) {
      fetchProducts();
      setMessage({
        type: 'success',
        text: product.isActive ? 'Hidden from customer store' : 'Now visible on customer store',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete “${name}”?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage({ type: 'success', text: 'Product deleted' });
      fetchProducts();
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === '' || product.category.id === filterCategory;
      const matchesStatus =
        filterStatus === STATUS_FILTER_ALL ||
        (filterStatus === 'active' && product.isActive) ||
        (filterStatus === 'inactive' && !product.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, filterCategory, filterStatus]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, { name: string; items: Product[] }>();
    for (const p of filteredProducts) {
      const key = p.category.id;
      if (!map.has(key)) map.set(key, { name: p.category.name, items: [] });
      map.get(key)!.items.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [filteredProducts]);

  if (loading) return <LoadingScreen message="Loading products..." />;

  return (
    <>
      <PageHeader
        title="Products"
        description="Add products by category — active products show on the customer store"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => seedSampleProducts()}
              disabled={seeding || categories.length === 0}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
            >
              {seeding ? 'Adding…' : '⚡ Sample products (all categories)'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              {showAddForm ? 'Cancel' : '+ Add product'}
            </button>
          </div>
        }
      />

      {message && (
        <AlertBanner variant={message.type} message={message.text} onDismiss={() => setMessage(null)} />
      )}

      <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
        <strong>Customer store:</strong> Products with status <strong>Active</strong> appear on{' '}
        <Link href="/customer/products" className="font-semibold text-[#2563eb] underline">
          /customer/products
        </Link>{' '}
        and home page, filtered by category.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name or SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? '🖼️ ' : cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof STATUS_FILTER_ALL | 'active' | 'inactive')
              }
              className={inputClass}
            >
              <option value={STATUS_FILTER_ALL}>All</option>
              <option value="active">Active (on store)</option>
              <option value="inactive">Hidden</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 text-lg font-semibold text-slate-900">Add product</h2>

          <div>
            <label className="text-xs font-medium text-slate-600">Product name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Wireless Earbuds"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? '🖼️ ' : cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  {cat.isVisible === false ? ' (hidden)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Selling price (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className={inputClass}
              placeholder="999"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Cost price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className={inputClass}
              placeholder="600"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">SKU (optional)</label>
            <input
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className={inputClass}
              placeholder="EARBUDS-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Image URL (optional)</label>
            <input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className={inputClass}
              placeholder="https://… or /images/product.jpg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Show on customer store (active)
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </form>
      )}

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories
            .filter((c) => c.isVisible !== false)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                disabled={seeding}
                onClick={() => seedSampleProducts(cat.id)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                + 3 samples: {cat.name}
              </button>
            ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? 'No products yet' : 'No matches'}
          description={
            products.length === 0
              ? 'Add a product manually or use “Sample products” to fill each category.'
              : 'Try different filters.'
          }
          actionLabel={products.length === 0 ? 'Add sample products' : undefined}
          onAction={products.length === 0 ? () => seedSampleProducts() : undefined}
        />
      ) : (
        <div className="space-y-8">
          {productsByCategory.map(([catId, group]) => (
            <section key={catId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="font-semibold text-slate-900">{group.name}</h3>
                <Link
                  href={`/customer/products?category=${catId}`}
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on store →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Store</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.items.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{product.description}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{formatINR(product.price)}</td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3 text-slate-500">{product.sku || '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleActive(product)}
                            className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                              product.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Hidden'}
                          </button>
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          <Link
                            href={`/customer/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#2563eb]"
                          >
                            Preview
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-xs font-semibold text-rose-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
