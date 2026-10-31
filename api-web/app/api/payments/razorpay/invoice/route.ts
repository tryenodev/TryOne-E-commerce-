import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import {
  calculateInvoiceTotal,
  type InvoiceLineItem,
} from '@/lib/invoice-total';
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
      items,
      shopName,
      customerName,
      customerEmail,
      customerPhone,
    } = body as {
      items: InvoiceLineItem[];
      shopName?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Add at least one item to the invoice' },
        { status: 400 }
      );
    }

    const total = calculateInvoiceTotal(items);
    if (total <= 0) {
      return NextResponse.json(
        { error: 'Invoice total must be greater than zero' },
        { status: 400 }
      );
    }

    const receipt = `INV-${Date.now()}`;
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: toPaise(total),
      currency: 'INR',
      receipt,
      notes: {
        type: 'simple_invoice',
        shopName: shopName || '',
        customerName: customerName || user.name || '',
        customerEmail: customerEmail || user.email,
        customerPhone: customerPhone || '',
        itemCount: String(items.length),
      },
    });

    return NextResponse.json(
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: getRazorpayKeyId(),
        receipt,
        total,
        customer: {
          name: customerName || user.name || 'Customer',
          email: customerEmail || user.email,
          contact: customerPhone || '9999999999',
        },
        description: shopName
          ? `Invoice from ${shopName}`
          : 'Simple Invoice payment',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Razorpay invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice payment' },
      { status: 500 }
    );
  }
}
