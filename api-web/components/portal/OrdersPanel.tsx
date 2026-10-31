'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderStatus } from '@/lib/enums';
import { PageHeader } from '@/components/customer/PageHeader';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatINR, formatDate } from '@/lib/format';
import { getOrderStatusStyles, formatOrderStatus } from '@/lib/order-status';

interface Order {
  id: string;
  orderNumber?: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: string; quantity: number; price: number; product: { name: string } }[];
}

export function OrdersPanel({ title = 'Orders' }: { title?: string }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchOrders = async () => {
    const response = await fetch('/api/orders');
    const data = await response.json();
    if (response.ok) setOrders(data.orders ?? []);
  };

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: `Order marked as ${formatOrderStatus(newStatus)}` });
        fetchOrders();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Update failed' });
    }
  };

  if (loading) return <LoadingScreen message="Loading orders..." />;

  const filtered =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const pendingCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;

  return (
    <>
      <PageHeader
        title={title}
        description={`${orders.length} total · ${pendingCount} pending`}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {formatOrderStatus(s)}
              </option>
            ))}
          </select>
        }
      />

      {message && (
        <AlertBanner
          variant={message.type}
          message={message.text}
          onDismiss={() => setMessage(null)}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No orders found" description="Orders will appear here when customers place them." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {order.orderNumber ?? order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{order.user.name}</p>
                      <p className="text-xs text-slate-500">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums">
                      {formatINR(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getOrderStatusStyles(order.status)}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {order.status === OrderStatus.PENDING && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, OrderStatus.CONFIRMED)}
                              className="text-sky-600 hover:text-sky-800"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === OrderStatus.CONFIRMED && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, OrderStatus.PROCESSING)}
                            className="text-violet-600 hover:text-violet-800"
                          >
                            Process
                          </button>
                        )}
                        {order.status === OrderStatus.PROCESSING && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, OrderStatus.SHIPPED)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Ship
                          </button>
                        )}
                        {order.status === OrderStatus.SHIPPED && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            Deliver
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
