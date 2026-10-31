'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';
import { PageHeader } from '@/components/customer/PageHeader';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatINR } from '@/lib/format';

type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  taxPercent: number;
  discountPercent: number;
};

function lineTotal(item: Omit<InvoiceItem, 'id'>): number {
  const subtotal = item.quantity * item.price;
  const afterDiscount = subtotal * (1 - item.discountPercent / 100);
  return afterDiscount * (1 + item.taxPercent / 100);
}

function newItem(): InvoiceItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    price: 0,
    taxPercent: 0,
    discountPercent: 0,
  };
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

export default function SimpleInvoicePage() {
  const { data: session } = useSession();
  const [shopName, setShopName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [draft, setDraft] = useState<InvoiceItem>(newItem());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paying, setPaying] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState<boolean | null>(null);
  const [setupHint, setSetupHint] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/payments/razorpay/status')
      .then((res) => res.json())
      .then((data) => {
        setRazorpayReady(Boolean(data.configured));
        if (data.hint) setSetupHint(data.hint);
      })
      .catch(() => setRazorpayReady(false));
  }, []);

  useEffect(() => {
    if (session?.user?.name) setCustomerName(session.user.name);
    if (session?.user?.email) setCustomerEmail(session.user.email ?? '');
  }, [session]);

  const total = useMemo(() => items.reduce((sum, item) => sum + lineTotal(item), 0), [items]);

  const addItem = () => {
    if (!draft.name.trim() || draft.quantity <= 0 || draft.price <= 0) {
      setMessage({ type: 'error', text: 'Enter item name, quantity, and price' });
      return;
    }
    setItems((prev) => [...prev, { ...draft, id: crypto.randomUUID() }]);
    setDraft(newItem());
    setMessage(null);
  };

  const handleMakeInvoice = async () => {
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item' });
      return;
    }
    try {
      setPaying(true);
      setMessage(null);
      const response = await fetch('/api/payments/razorpay/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ name, quantity, price, taxPercent, discountPercent }) => ({
            name,
            quantity,
            price,
            taxPercent,
            discountPercent,
          })),
          shopName,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.hint ? `${data.error}. ${data.hint}` : data.error || 'Failed to create invoice',
        });
        return;
      }
      await openRazorpayCheckout({
        keyId: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        orderId: data.razorpayOrderId,
        name: data.description || 'Simple Invoice',
        description: `Invoice ${data.receipt}`,
        prefill: {
          name: data.customer?.name,
          email: data.customer?.email,
          contact: data.customer?.contact,
        },
        onSuccess: async (payment) => {
          const verifyRes = await fetch('/api/payments/razorpay/verify-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }
          setItems([]);
          setMessage({ type: 'success', text: 'Invoice paid successfully!' });
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message !== 'Payment cancelled') {
        setMessage({ type: 'error', text: error.message });
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Simple invoice"
        description="Create an invoice and collect payment via Razorpay."
        actions={
          <button
            type="button"
            onClick={handleMakeInvoice}
            disabled={paying || items.length === 0 || razorpayReady === false}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {paying ? 'Processing...' : 'Make invoice & pay'}
          </button>
        }
      />

      {razorpayReady === false && (
        <AlertBanner variant="warning" message={`Razorpay is not configured. ${setupHint}`} />
      )}
      {message && (
        <AlertBanner
          variant={message.type}
          message={message.text}
          onDismiss={() => setMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Shop details</h2>
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Shop / business name"
            className={fieldClass}
          />
          <h2 className="font-semibold text-slate-900 pt-2">Customer details</h2>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className={fieldClass} />
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" type="email" className={fieldClass} />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone" className={fieldClass} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Add item</h2>
          <div className="space-y-3">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Item name"
              className={fieldClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={draft.quantity || ''}
                onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
                placeholder="Qty"
                className={fieldClass}
              />
              <input
                type="number"
                value={draft.price || ''}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                placeholder="Price (₹)"
                className={fieldClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={draft.taxPercent || ''}
                onChange={(e) => setDraft({ ...draft, taxPercent: Number(e.target.value) })}
                placeholder="Tax %"
                className={fieldClass}
              />
              <input
                type="number"
                value={draft.discountPercent || ''}
                onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })}
                placeholder="Discount %"
                className={fieldClass}
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="w-full rounded-xl bg-violet-100 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-200"
            >
              Add line item
            </button>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Line items</h2>
          <p className="text-lg font-bold text-emerald-700 tabular-nums">{formatINR(total)}</p>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No items added yet</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {formatINR(item.price)} · Tax {item.taxPercent}% · Disc{' '}
                    {item.discountPercent}%
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold tabular-nums">{formatINR(lineTotal(item))}</p>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-xs text-rose-600 hover:text-rose-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
