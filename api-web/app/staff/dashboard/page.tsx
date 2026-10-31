'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/customer/PageHeader';
import { StatCard } from '@/components/customer/StatCard';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { OrderStatus } from '@/lib/enums';
import { isActiveOrderStatus } from '@/lib/order-status';

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    lowStock: 0,
    todayOrders: 0,
  });

  useEffect(() => {
    const today = new Date().toDateString();
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/admin/products').then((r) => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        const orders = ordersData.orders ?? [];
        const products = productsData.products ?? [];
        setStats({
          pending: orders.filter((o: { status: string }) => o.status === OrderStatus.PENDING).length,
          active: orders.filter((o: { status: string }) => isActiveOrderStatus(o.status)).length,
          lowStock: products.filter((p: { stock: number }) => p.stock < 10).length,
          todayOrders: orders.filter(
            (o: { createdAt: string }) => new Date(o.createdAt).toDateString() === today
          ).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading workspace..." />;

  return (
    <>
      <PageHeader
        title={`Welcome, ${session?.user?.name?.split(' ')[0] ?? 'Staff'}`}
        description="Fulfill orders and monitor inventory."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Pending orders" value={stats.pending} accent="amber" hint="Needs action" />
        <StatCard label="Active orders" value={stats.active} accent="sky" />
        <StatCard label="Low stock" value={stats.lowStock} accent="violet" hint="Below 10 units" />
        <StatCard label="Orders today" value={stats.todayOrders} accent="emerald" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Your tasks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/staff/orders"
            className="rounded-xl bg-sky-600 px-4 py-4 text-center text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
          >
            Process orders
          </Link>
          <Link
            href="/staff/products"
            className="rounded-xl border border-slate-200 px-4 py-4 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Check inventory
          </Link>
        </div>
      </section>
    </>
  );
}
