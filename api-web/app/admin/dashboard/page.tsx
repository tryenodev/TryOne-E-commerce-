'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { StatCard } from '@/components/customer/StatCard';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { formatINR } from '@/lib/format';
import { OrderStatus } from '@/lib/enums';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
    pending: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/sales').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ])
      .then(([analytics, ordersData, usersData, productsData]) => {
        const orders = ordersData.orders ?? [];
        setStats({
          revenue: analytics.summary?.thisMonthSales ?? 0,
          orders: orders.length,
          users: usersData.users?.length ?? 0,
          products: productsData.products?.length ?? 0,
          pending: orders.filter(
            (o: { status: string }) => o.status === OrderStatus.PENDING
          ).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading admin dashboard..." />;

  return (
    <>
      <PageHeader
        title={`Welcome, ${session?.user?.name?.split(' ')[0] ?? 'Admin'}`}
        description="Full system control — products, orders, users, and analytics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Revenue (month)" value={formatINR(stats.revenue)} accent="emerald" />
        <StatCard label="Total orders" value={stats.orders} accent="sky" />
        <StatCard label="Users" value={stats.users} accent="violet" />
        <StatCard label="Products" value={stats.products} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Operations</h2>
          <p className="text-3xl font-bold text-rose-600 tabular-nums mb-4">
            {stats.pending}
          </p>
          <p className="text-sm text-slate-500 mb-4">Orders awaiting confirmation</p>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            Manage orders →
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Quick links</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/admin/analytics', label: 'Analytics' },
              { href: '/admin/products', label: 'Products' },
              { href: '/admin/categories', label: 'Categories' },
              { href: '/admin/menu', label: 'Store Menu' },
              { href: '/admin/orders', label: 'Orders' },
              { href: '/admin/users', label: 'Users' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
