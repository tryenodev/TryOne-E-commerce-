import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@/lib/enums';

export type OrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
};

type CreateOrderOptions = {
  userId: string;
  items: OrderItemInput[];
  total: number;
  orderNumber?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  decrementStock?: boolean;
};

export async function createOrderRecord({
  userId,
  items,
  total,
  orderNumber: orderNumberInput,
  paymentMethod,
  paymentStatus = PaymentStatus.NOT_REQUIRED,
  razorpayOrderId,
  decrementStock = true,
}: CreateOrderOptions) {
  const orderNumber =
    orderNumberInput ??
    `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber,
      total,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (decrementStock) {
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

  return order;
}
