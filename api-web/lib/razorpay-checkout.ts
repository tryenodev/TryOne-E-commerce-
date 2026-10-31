export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type OpenRazorpayCheckoutParams = {
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onDismiss?: () => void;
};

export async function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Razorpay checkout could not be loaded');
  }

  const RazorpayConstructor = window.Razorpay;

  return new Promise((resolve, reject) => {
    const rzp = new RazorpayConstructor({
      key: params.keyId,
      amount: params.amount,
      currency: params.currency,
      name: params.name,
      description: params.description,
      order_id: params.orderId,
      prefill: params.prefill,
      theme: { color: '#2563eb' },
      handler: async (response) => {
        try {
          await params.onSuccess(response);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          params.onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    });

    rzp.on('payment.failed', (response) => {
      reject(
        new Error(response.error?.description || 'Payment failed')
      );
    });

    rzp.open();
  });
}
