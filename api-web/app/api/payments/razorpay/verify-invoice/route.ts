import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import {
  isRazorpayConfigured,
  RAZORPAY_SETUP_HINT,
  verifyRazorpaySignature,
} from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Razorpay is not configured', hint: RAZORPAY_SETUP_HINT },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice payment successful',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Razorpay verify invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to verify invoice payment' },
      { status: 500 }
    );
  }
}
