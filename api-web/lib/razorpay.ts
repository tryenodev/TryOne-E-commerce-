import crypto from 'crypto';
import Razorpay from 'razorpay';

export const RAZORPAY_SETUP_HINT =
  'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables (Vercel: Project Settings → Environment Variables, Local: api-web/.env), then redeploy/restart.';

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return Boolean(keyId && keySecret);
}

export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Razorpay key id is not configured');
  }
  return keyId;
}

export function toPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return expected === signature;
  }
}
