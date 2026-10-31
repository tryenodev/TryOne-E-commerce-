import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';
import { OrderStatus, UserRole } from '@/lib/enums';
import {
  isRazorpayConfigured,
  RAZORPAY_SETUP_HINT,
  verifyRazorpaySignature,
} from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user || user.role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { error: 'Unauthorized - Customer access required' },
        { status: 403 }
      );
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
      orderId,
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

    const order = await prisma.order.findFirst({
      where: {
        ...(orderId ? { id: orderId } : {}),
        razorpayOrderId: razorpayOrderId,
        userId: user.id,
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        success: true,
        order,
        message: 'Payment already confirmed',
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const paidOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
        },
        include: {
          items: { include: { product: true } },
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return paidOrder;
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'Payment successful',
    });
  } catch (error) {
    console.error('Razorpay verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
