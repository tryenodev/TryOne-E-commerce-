function toValidDate(date: string | Date | null | undefined): Date | null {
  if (date == null || date === '') return null;
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatINR(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined, fallback = '—'): string {
  const parsed = toValidDate(date);
  if (!parsed) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function formatDateTime(date: string | Date | null | undefined, fallback = '—'): string {
  const parsed = toValidDate(date);
  if (!parsed) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
