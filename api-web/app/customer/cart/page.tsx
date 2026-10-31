'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductMedia } from '@/components/customer/marketplace/ProductMedia';
import { useCart } from '@/contexts/CartContext';
import { PaymentMethod, isOnlinePaymentMethod } from '@/lib/enums';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';
import { EmptyState } from '@/components/customer/EmptyState';
import { AlertBanner } from '@/components/customer/AlertBanner';
import { formatINR } from '@/lib/format';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [razorpayReady, setRazorpayReady] = useState<boolean | null>(null);
  const [setupHint, setSetupHint] = useState('');

  const isOnline = isOnlinePaymentMethod(paymentMethod);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce((sum, item) => sum + item.price * item.quantity * 0.12, 0);

  useEffect(() => {
    fetch('/api/payments/razorpay/status')
      .then((res) => res.json())
      .then((data) => {
        setRazorpayReady(Boolean(data.configured));
        if (data.hint) setSetupHint(String(data.hint));
      })
      .catch(() => setRazorpayReady(false));
  }, []);

  useEffect(() => {
    if (razorpayReady === false && isOnline) {
      setPaymentMethod(PaymentMethod.CASH);
      setMessage({
        type: 'error',
        text: setupHint
          ? `Online payment is unavailable. ${setupHint}`
          : 'Online payment is unavailable. Please use Cash on Delivery.',
      });
    }
  }, [razorpayReady, isOnline, setupHint]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    try {
      setPlacing(true);
      setMessage(null);

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getCartTotal(),
        paymentMethod,
      };

      const endpoint = isOnline ? '/api/payments/razorpay/create' : '/api/orders';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.hint ? `${data.error}. ${data.hint}` : data.error || 'Checkout failed',
        });
        return;
      }

      if (isOnline && data.razorpayOrderId) {
        clearCart();
        await openRazorpayCheckout({
          keyId: data.keyId,
          amount: data.amount,
          currency: data.currency || 'INR',
          orderId: data.razorpayOrderId,
          name: 'Tryeno One',
          description: `Order ${data.order.orderNumber}`,
          prefill: {
            name: session?.user?.name || undefined,
            email: session?.user?.email || undefined,
          },
          onSuccess: async (payment) => {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payment, orderId: data.order.id }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
            router.push('/customer/orders');
          },
        });
        return;
      }

      clearCart();
      router.push('/customer/orders');
    } catch (error) {
      if (error instanceof Error && error.message !== 'Payment cancelled') {
        setMessage({ type: 'error', text: error.message });
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <div className="store-panel px-4 sm:px-5 py-4 mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">
          My Cart <span className="text-sm font-normal text-slate-500">({itemCount} items)</span>
        </h1>
        <Link href="/customer/products" className="text-sm font-semibold text-[#2563eb] hover:underline">
          Continue shopping
        </Link>
      </div>

      {message && (
        <AlertBanner variant={message.type} message={message.text} onDismiss={() => setMessage(null)} />
      )}
      {razorpayReady === false && !message && (
        <AlertBanner
          variant="warning"
          message={`Razorpay is not configured. ${setupHint || 'Please configure keys in environment variables.'}`}
        />
      )}

      {cart.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products from the shop to get started."
          actionLabel="Browse products"
          actionHref="/customer/products"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="store-panel p-4 flex gap-4"
              >
                <Link
                  href={`/customer/products/${item.id}`}
                  className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 border border-slate-100 rounded-sm overflow-hidden"
                >
                  <ProductMedia
                    name={item.name}
                    categoryName=""
                    images={item.image ? [item.image] : null}
                    className="w-full h-full"
                    emojiClassName="text-3xl"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/customer/products/${item.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-[#2563eb] line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#388e3c] font-medium mt-1">In stock</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center border border-slate-200 rounded-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 text-sm"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-base font-bold tabular-nums text-slate-900">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-xs font-semibold text-[#2563eb] hover:underline"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 store-panel p-4 sm:p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Price details</p>
              <dl className="space-y-2 text-sm border-b border-slate-100 pb-3">
                <div className="flex justify-between text-slate-600">
                  <dt>Price ({itemCount} items)</dt>
                  <dd className="tabular-nums">{formatINR(getCartTotal() + savings)}</dd>
                </div>
                <div className="flex justify-between text-[#388e3c]">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">−{formatINR(savings)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Delivery Charges</dt>
                  <dd className="text-[#388e3c] font-medium">FREE</dd>
                </div>
              </dl>
              <div className="flex justify-between py-3 text-base font-semibold text-slate-900">
                <dt>Total Amount</dt>
                <dd className="tabular-nums">{formatINR(getCartTotal())}</dd>
              </div>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-sm border border-slate-200 px-3 py-2 text-sm mb-3 focus:border-[#2563eb] focus:outline-none"
              >
                <option value={PaymentMethod.CASH}>Cash on delivery</option>
                <option value={PaymentMethod.CARD} disabled={razorpayReady === false}>
                  Card (Razorpay)
                </option>
                <option value={PaymentMethod.UPI} disabled={razorpayReady === false}>
                  UPI (Razorpay)
                </option>
                <option value={PaymentMethod.NET_BANKING} disabled={razorpayReady === false}>
                  Net banking (Razorpay)
                </option>
              </select>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing || (isOnline && razorpayReady === false)}
                className="w-full rounded-sm bg-[#fb641b] hover:bg-[#e85a17] py-3 text-sm font-semibold text-white disabled:opacity-60 shadow-sm"
              >
                {placing
                  ? isOnline
                    ? 'Opening payment...'
                    : 'Placing order...'
                  : 'PLACE ORDER'}
              </button>
              <p className="mt-2 text-[10px] text-slate-500 text-center">
                Safe and secure payments · Easy returns
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
