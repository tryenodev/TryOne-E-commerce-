import { OrderStatus } from '@/lib/enums';

export function getOrderStatusStyles(status: string): string {
  const colors: Record<string, string> = {
    [OrderStatus.PENDING]: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    [OrderStatus.CONFIRMED]: 'bg-sky-50 text-sky-800 ring-sky-600/20',
    [OrderStatus.PROCESSING]: 'bg-violet-50 text-violet-800 ring-violet-600/20',
    [OrderStatus.PACKED]: 'bg-indigo-50 text-indigo-800 ring-indigo-600/20',
    [OrderStatus.SHIPPED]: 'bg-orange-50 text-orange-800 ring-orange-600/20',
    [OrderStatus.DELIVERED]: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-800 ring-rose-600/20',
  };
  return colors[status] ?? 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

export function formatOrderStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function isActiveOrderStatus(status: string): boolean {
  return (
    status !== OrderStatus.DELIVERED &&
    status !== OrderStatus.CANCELLED
  );
}
