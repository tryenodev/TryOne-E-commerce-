import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { getApiUser } from '@/lib/api-session';
import { createOrderRecord } from '@/lib/create-order';
import { ensureCheckoutProducts } from '@/lib/ensure-checkout-products';
import {
  UserRole,
  PaymentMethod,
  isOnlinePaymentMethod,
} from '@/lib/enums';
import { prisma } from '@/lib/prisma';
import {
  getRazorpayInstance,
  getRazorpayKeyId,
  isRazorpayConfigured,
  RAZORPAY_SETUP_HINT,
  toPaise,
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
    const { items, total, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !isOnlinePaymentMethod(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method for online checkout' },
        { status: 400 }
      );
    }

    const orderTotal = parseFloat(total);
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    await ensureCheckoutProducts(
      items.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(String(item.price)),
      }))
    );

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await createOrderRecord({
      userId: user.id,
      orderNumber,
      items: items.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(String(item.price)),
      })),
      total: orderTotal,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      razorpayOrderId: undefined,
      decrementStock: false,
    });

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: toPaise(orderTotal),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        appOrderId: order.id,
        customerEmail: user.email,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json(
      {
        order: { ...order, razorpayOrderId: razorpayOrder.id },
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: getRazorpayKeyId(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Razorpay create payment error:', error);
    const msg = error instanceof Error ? error.message : '';
    const hint =
      /foreign key|constraint|productid|product not found/i.test(msg)
        ? 'One or more cart products are missing in DB. Hardcoded products have now been auto-synced; retry checkout.'
        : undefined;
    return NextResponse.json(
      { error: 'Failed to create Razorpay order', ...(hint ? { hint } : {}) },
      { status: 500 }
    );
  }
}
