'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';

type MenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  location: string;
};

type Category = { id: string; name: string; icon?: string };

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

const LOCATION_OPTIONS = [
  { value: 'HEADER', label: 'Header nav (top tabs)' },
  { value: 'FOOTER', label: 'Footer only' },
  { value: 'BOTH', label: 'Header & footer' },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    href: '/customer/products',
    sortOrder: '0',
    isActive: true,
    location: 'HEADER',
    categoryId: '',
  });

  const fetchItems = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/menu').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ])
      .then(([menuData, catData]) => {
        setItems(menuData.items ?? []);
        setCategories(catData.categories ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const syncFromCategories = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/store/sync-menu', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Menu synced: ${data.created} new links, ${data.updated} updated. Customer header will show category tabs.`,
        });
        fetchItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    } finally {
      setSyncing(false);
    }
  };

  const onCategoryPick = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) {
      setForm((f) => ({ ...f, categoryId: '', href: '/customer/products' }));
      return;
    }
    setForm((f) => ({
      ...f,
      categoryId,
      label: cat.name,
      href: `/customer/products?category=${cat.id}`,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: 'Menu item added — visible on customer store' });
      setShowForm(false);
      setForm({
        label: '',
        href: '/customer/products',
        sortOrder: '0',
        isActive: true,
        location: 'HEADER',
        categoryId: '',
      });
      fetchItems();
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to add' });
    }
  };

  const toggleActive = async (item: MenuItem) => {
    await fetch(`/api/admin/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    fetchItems();
  };

  const updateField = async (id: string, field: string, value: string | number | boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage({ type: 'success', text: 'Menu item deleted' });
      fetchItems();
    }
  };

  if (loading) return <LoadingScreen message="Loading menu..." />;

  return (
    <>
      <PageHeader
        title="Store menu"
        description="Header tabs & footer links on the customer storefront"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={syncFromCategories}
              disabled={syncing || categories.length === 0}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              {syncing ? 'Syncing…' : '🔄 Sync from categories'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              {showForm ? 'Cancel' : '+ Add menu item'}
            </button>
          </div>
        }
      />

      {message && (
        <AlertBanner variant={message.type} message={message.text} onDismiss={() => setMessage(null)} />
      )}

      <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
        <strong>Tip:</strong> Use shop links only (e.g. category pages). Orders, wishlist & cart are already in the header.
        <strong> Sync from categories</strong> creates one tab per visible category.
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Link to category (optional)</label>
            <select
              value={form.categoryId}
              onChange={(e) => onCategoryPick(e.target.value)}
              className={inputClass}
            >
              <option value="">Custom link…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon && (c.icon.startsWith('/') || c.icon.startsWith('http')) ? '🖼️ ' : c.icon ? `${c.icon} ` : ''}{c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Label *</label>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className={inputClass}
              placeholder="Electronics"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Link (href) *</label>
            <input
              required
              value={form.href}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
              className={inputClass}
              placeholder="/customer/products?category=..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Show in</label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
            >
              {LOCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active (visible to customers)
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Save menu item
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No menu items"
          description="Add categories first, then click Sync from categories."
          actionLabel="Sync from categories"
          onAction={categories.length > 0 ? syncFromCategories : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Label', 'Link', 'Location', 'Order', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.label}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[240px] truncate" title={item.href}>
                    {item.href}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={item.location}
                      onChange={(e) => updateField(item.id, 'location', e.target.value)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    >
                      {LOCATION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={item.sortOrder}
                      onBlur={(e) => updateField(item.id, 'sortOrder', Number(e.target.value))}
                      className="w-16 rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      className={`text-xs font-semibold ${item.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      {item.isActive ? 'Yes' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
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
      )}
    </>
  );
}
