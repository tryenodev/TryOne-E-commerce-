import { NextRequest, NextResponse } from 'next/server';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { HARDCODED_CATEGORIES } from '@/lib/hardcoded-store-data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List all categories
 *     description: Returns a list of all product categories. Public endpoint.
 *     responses:
 *       200:
 *         description: A list of categories
 *       500:
 *         description: Server error
 */
// GET - List all categories (Public)
export async function GET(request: NextRequest) {
  try {
    await ensureStoreSchema();
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (categories.length === 0) {
      return NextResponse.json({ categories: HARDCODED_CATEGORIES, source: 'hardcoded' }, { status: 200 });
    }

    return NextResponse.json({ categories, source: 'database' }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: HARDCODED_CATEGORIES, source: 'hardcoded' }, { status: 200 });
  }
}
