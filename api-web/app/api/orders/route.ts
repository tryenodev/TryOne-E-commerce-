import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { createOrderRecord } from '@/lib/create-order';
import { ensureCheckoutProducts } from '@/lib/ensure-checkout-products';
import { prisma } from '@/lib/prisma';
import { UserRole, PaymentMethod } from '@/lib/enums';

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create new order
 *     description: Places a new order. Requires CUSTOMER role.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Order must contain at least one item
 *       403:
 *         description: Unauthorized
 */
// POST - Create new order (Customer only)
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user || user.role !== UserRole.CUSTOMER) {
      return NextResponse.json(
        { error: 'Unauthorized - Customer access required' },
        { status: 403 }
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

    if (paymentMethod && paymentMethod !== PaymentMethod.CASH) {
      return NextResponse.json(
        { error: 'Use online checkout for card, UPI, or net banking' },
        { status: 400 }
      );
    }

    await ensureCheckoutProducts(
      items.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(String(item.price)),
      }))
    );

    const order = await createOrderRecord({
      userId: user.id,
      items: items.map((item: { productId: string; quantity: number; price: number }) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(String(item.price)),
      })),
      total: parseFloat(total),
      paymentMethod: paymentMethod || PaymentMethod.CASH,
    });

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user's orders or all orders
 *     description: Customers see their own orders. Admin and Staff see all orders.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       403:
 *         description: Unauthorized
 */
// GET - Get customer's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userRole = user.role;

    let orders;

    if (userRole === UserRole.CUSTOMER) {
      // Customers see only their own orders
      orders = await prisma.order.findMany({
        where: {
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (userRole === UserRole.ADMIN || userRole === UserRole.STAFF) {
      // Admin and Staff see all orders
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
