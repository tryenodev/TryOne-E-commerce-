'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { formatINR } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  isActive: boolean;
  category: { name: string };
}

export default function StaffProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading inventory..." />;

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = products.filter((p) => p.stock < 10).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${products.length} products · ${lowStock} low stock alerts`}
      />

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Product', 'Category', 'SKU', 'Price', 'Stock', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className={p.stock < 10 ? 'bg-amber-50/50' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.category.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium tabular-nums">
                    {formatINR(p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        p.stock < 10 ? 'text-amber-700' : 'text-slate-900'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
