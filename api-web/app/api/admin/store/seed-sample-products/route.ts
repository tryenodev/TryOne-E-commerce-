import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';
import { getSampleProductsForCategory } from '@/lib/store-sample-products';

/**
 * POST — Add demo products for each visible category (skips existing SKUs).
 * Body: { categoryId?: string } — optional, seed only one category.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : undefined;

    const categories = await prisma.category.findMany({
      where: {
        isVisible: true,
        ...(categoryId ? { id: categoryId } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (categories.length === 0) {
      return NextResponse.json(
        { error: categoryId ? 'Category not found or hidden' : 'No visible categories. Add categories first.' },
        { status: 400 }
      );
    }

    let created = 0;
    let skipped = 0;

    for (const cat of categories) {
      const samples = getSampleProductsForCategory(cat.slug, cat.name);
      for (const sample of samples) {
        const sku = `DEMO-${cat.slug.toUpperCase().replace(/-/g, '_')}-${sample.skuSuffix}`;
        const exists = await prisma.product.findUnique({ where: { sku } });
        if (exists) {
          skipped++;
          continue;
        }

        await prisma.product.create({
          data: {
            name: sample.name,
            description: sample.description,
            price: sample.price,
            costPrice: sample.costPrice,
            stock: sample.stock,
            sku,
            categoryId: cat.id,
            images: [],
            isActive: true,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: 'Sample products added',
      created,
      skipped,
      categories: categories.length,
    });
  } catch (error) {
    console.error('Seed sample products error:', error);
    const hint =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'Failed to seed sample products';
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
