'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  _count: { products: number };
};

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySource, setCategorySource] = useState<'database' | 'hardcoded' | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [syncingMenu, setSyncingMenu] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '🛍️',
    sortOrder: '0',
    isVisible: true,
  });

  const syncMenuFromCategories = async () => {
    setSyncingMenu(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/store/sync-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeExtras: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Menu updated: ${data.created} new links, ${data.updated} updated (${data.total} categories). Customer header tabs are ready.`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Menu sync failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    } finally {
      setSyncingMenu(false);
    }
  };

  const applyRecommended = async () => {
    if (!confirm('Add hardcoded categories, menu and products for the store?')) return;
    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/store/seed-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncMenu: true, seedProducts: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Done! Categories: +${data.categoriesCreated}, Menu: +${data.menuCreated}, Products: +${data.productsCreated} (${data.productsSkipped} already existed).`,
        });
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    } finally {
      setSeeding(false);
    }
  };

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/admin/categories', { credentials: 'same-origin' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          throw new Error(d.error || 'Failed to load categories');
        }
        setCategories(d.categories ?? []);
        setCategorySource(d.source === 'hardcoded' ? 'hardcoded' : 'database');
      })
      .catch((err: Error) => {
        setMessage({
          type: 'error',
          text:
            err.message === 'Failed to load categories'
              ? 'Could not load categories. Restart the dev server after schema changes (npm run dev).'
              : err.message,
        });
        setCategories([]);
        setCategorySource(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sortOrder: Number(form.sortOrder),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({
        type: 'success',
        text: data.menuSynced
          ? 'Category created — header menu link added automatically'
          : 'Category created (hidden — not added to menu until visible)',
      });
      setShowForm(false);
      setForm({ name: '', description: '', icon: '🛍️', sortOrder: '0', isVisible: true });
      fetchCategories();
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to create' });
    }
  };

  const toggleVisible = async (cat: Category) => {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !cat.isVisible }),
    });
    if (res.ok) {
      fetchCategories();
      setMessage({ type: 'success', text: 'Category updated' });
    }
  };

  const updateField = async (id: string, field: string, value: string | number) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) fetchCategories();
    else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Update failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: 'Category deleted' });
      fetchCategories();
    } else {
      setMessage({ type: 'error', text: data.error || 'Delete failed' });
    }
  };

  if (loading) return <LoadingScreen message="Loading categories..." />;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage store categories shown to customers"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={applyRecommended}
              disabled={seeding}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              {seeding ? 'Adding…' : '⚡ Add hardcoded categories + menu + products'}
            </button>
            <button
              type="button"
              onClick={syncMenuFromCategories}
              disabled={syncingMenu || seeding || categories.length === 0}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
            >
              {syncingMenu ? 'Syncing…' : '🔗 Sync menu from categories'}
            </button>
            <button
              type="button"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                const res = await fetch('/api/admin/store/cleanup-duplicates', { method: 'POST' });
                const data = await res.json();
                setMessage(
                  res.ok
                    ? { type: 'success', text: `Cleaned: ${data.menuRemoved} duplicate menu links removed.` }
                    : { type: 'error', text: data.error || 'Failed' }
                );
                fetchCategories();
                setSeeding(false);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Clean duplicates
            </button>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              {showForm ? 'Cancel' : '+ Add category'}
            </button>
          </div>
        }
      />

      {categorySource === 'hardcoded' && (
        <AlertBanner
          variant="error"
          message="Database is not connected — showing demo categories only. Start Docker (docker-compose up -d) and restart the dev server, or check DATABASE_URL on Vercel."
        />
      )}

      {message && (
        <AlertBanner variant={message.type} message={message.text} onDismiss={() => setMessage(null)} />
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Icon (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Sort order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
              Visible to customers
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700">
              Save category
            </button>
          </div>
        </form>
      )}

      <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
        <strong>Customer portal:</strong> Visible categories appear in the category strip, filters, and header menu.
        Use <strong>Add hardcoded categories + menu + products</strong> to populate everything in one click.
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Click “Add hardcoded categories + menu + products” above to populate the customer store instantly."
          actionLabel="Add hardcoded data"
          onAction={applyRecommended}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Icon', 'Name', 'Slug', 'Products', 'Order', 'Visible', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3 text-xl">{cat.icon}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3">{cat._count.products}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={cat.sortOrder}
                      onBlur={(e) => updateField(cat.id, 'sortOrder', Number(e.target.value))}
                      className="w-16 rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleVisible(cat)} className={`text-xs font-semibold ${cat.isVisible ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {cat.isVisible ? 'Yes' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleDelete(cat.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">
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
