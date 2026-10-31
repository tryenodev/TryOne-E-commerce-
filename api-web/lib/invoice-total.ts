export type InvoiceLineItem = {
  name: string;
  quantity: number;
  price: number;
  taxPercent?: number;
  discountPercent?: number;
};

export function calculateInvoiceLineTotal(item: InvoiceLineItem): number {
  const qty = item.quantity > 0 ? item.quantity : 0;
  const price = item.price > 0 ? item.price : 0;
  const discount = item.discountPercent ?? 0;
  const tax = item.taxPercent ?? 0;

  const subtotal = qty * price;
  const afterDiscount = subtotal * (1 - discount / 100);
  return afterDiscount * (1 + tax / 100);
}

export function calculateInvoiceTotal(items: InvoiceLineItem[]): number {
  return items.reduce((sum, item) => sum + calculateInvoiceLineTotal(item), 0);
}
