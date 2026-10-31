import { NextRequest, NextResponse } from 'next/server';
import { HARDCODED_PRODUCTS } from '@/lib/hardcoded-store-data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List all active products
 *     description: Returns a list of all active products, along with their category. Public endpoint.
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       stockQuantity:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Failed to fetch products
 */
// GET - List all active products (Public). ?category=<id> filters by category.
export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('category') ?? undefined;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (products.length === 0) {
      const fallback = categoryId
        ? HARDCODED_PRODUCTS.filter((p) => p.categoryId === categoryId)
        : HARDCODED_PRODUCTS;
      return NextResponse.json({ products: fallback, source: 'hardcoded' }, { status: 200 });
    }

    return NextResponse.json({ products, source: 'database' }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    const categoryId = request.nextUrl.searchParams.get('category') ?? undefined;
    const fallback = categoryId
      ? HARDCODED_PRODUCTS.filter((p) => p.categoryId === categoryId)
      : HARDCODED_PRODUCTS;
    return NextResponse.json({ products: fallback, source: 'hardcoded' }, { status: 200 });
  }
}
