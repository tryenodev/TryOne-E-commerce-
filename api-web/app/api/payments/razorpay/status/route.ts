import { NextResponse } from 'next/server';
import { isRazorpayConfigured, RAZORPAY_SETUP_HINT } from '@/lib/razorpay';

export async function GET() {
  const configured = isRazorpayConfigured();
  return NextResponse.json({
    configured,
    ...(configured
      ? {}
      : {
          error: 'Razorpay is not configured',
          hint: RAZORPAY_SETUP_HINT,
        }),
  });
}
