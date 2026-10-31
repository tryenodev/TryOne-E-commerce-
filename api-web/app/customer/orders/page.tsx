'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageSection } from '@/components/customer/PageSection';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { IconPackage } from '@/components/customer/icons';
import { OrderStatus, STATUS_FILTER_ALL } from '@/lib/enums';
import { formatINR, formatDate } from '@/lib/format';
import { getOrderStatusStyles, formatOrderStatus } from '@/lib/order-status';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const inputClass =
  'w-full rounded-sm border border-slate-200 px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTER_ALL);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading orders..." />;
  }

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === STATUS_FILTER_ALL || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageSection
        title="My Orders"
        description={`${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
        action={
          <Link
            href="/customer/products"
            className="text-sm font-semibold text-[#2563eb] hover:underline shrink-0"
          >
            Continue shopping
          </Link>
        }
      />

      {orders.length > 0 && (
        <div className="bg-white shadow-sm rounded-sm p-4 mb-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="search"
              placeholder="Search by order # or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClass}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value={STATUS_FILTER_ALL}>All statuses</option>
              {Object.values(OrderStatus).map((s) => (
                <option key={s} value={s}>
                  {formatOrderStatus(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will appear here with tracking updates."
          actionLabel="Start shopping"
          actionHref="/customer/products"
        />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-sm p-8">
          <EmptyState title="No matching orders" description="Try different search or filters." />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full text-left bg-white shadow-sm rounded-sm hover:shadow-md border border-transparent hover:border-[#2563eb]/20 transition-all overflow-hidden group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                    <IconPackage className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-col sm:items-end shrink-0">
                  <span
                    className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold ${getOrderStatusStyles(order.status)}`}
                  >
                    {formatOrderStatus(order.status)}
                  </span>
                  <p className="text-lg font-bold text-slate-900 tabular-nums">{formatINR(order.total)}</p>
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
                <p className="text-sm text-slate-600 truncate">
                  {order.items[0]?.product.name}
                  {order.items.length > 1 && (
                    <span className="text-slate-400"> +{order.items.length - 1} more</span>
                  )}
                </p>
                <span className="text-xs font-semibold text-[#2563eb] shrink-0 group-hover:underline">
                  View details →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
