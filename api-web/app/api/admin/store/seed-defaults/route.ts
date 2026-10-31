import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getApiUser } from '@/lib/api-session';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { prisma } from '@/lib/prisma';
import { getSampleProductsForCategory } from '@/lib/store-sample-products';
import {
  DEFAULT_EXTRA_MENU,
  DEFAULT_STORE_CATEGORIES,
} from '@/lib/store-defaults';

export const dynamic = 'force-dynamic';

function getSeedDefaultsErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021' || error.code === 'P2022') {
      return 'Database schema is outdated on live. Run Prisma migration and redeploy.';
    }
    if (error.code === 'P1001') {
      return 'Database is unreachable. Check DATABASE_URL / DIRECT_URL on Vercel.';
    }
  }

  if (error instanceof Error && /database url|p1013/i.test(error.message)) {
    return 'Invalid database URL in Vercel env. Fix DATABASE_URL / DIRECT_URL.';
  }

  return process.env.NODE_ENV === 'development' && error instanceof Error
    ? error.message
    : 'Failed to apply store defaults';
}

/**
 * POST — Upsert recommended categories + menu links for the customer storefront.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const syncMenu = body.syncMenu !== false;
    const seedProducts = body.seedProducts !== false;

    let categoriesCreated = 0;
    let categoriesUpdated = 0;
    const categoryIds: { slug: string; id: string; name: string }[] = [];

    for (const cat of DEFAULT_STORE_CATEGORIES) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      const saved = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
          isVisible: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
          isVisible: true,
        },
      });
      categoryIds.push({ slug: cat.slug, id: saved.id, name: saved.name });
      if (existing) categoriesUpdated++;
      else categoriesCreated++;
    }

    let menuCreated = 0;
    if (syncMenu) {
      for (const cat of categoryIds) {
        const href = `/customer/products?category=${cat.id}`;
        const existing = await prisma.storeMenuItem.findFirst({
          where: { href },
        });
        if (!existing) {
          await prisma.storeMenuItem.create({
            data: {
              label: cat.name,
              href,
              sortOrder: DEFAULT_STORE_CATEGORIES.find((c) => c.slug === cat.slug)?.sortOrder ?? 0,
              isActive: true,
              location: 'HEADER',
            },
          });
          menuCreated++;
        } else {
          await prisma.storeMenuItem.update({
            where: { id: existing.id },
            data: { label: cat.name, isActive: true, location: 'HEADER' },
          });
        }
      }

      for (const item of DEFAULT_EXTRA_MENU) {
        const existing = await prisma.storeMenuItem.findFirst({
          where: { label: item.label, href: item.href },
        });
        if (!existing) {
          await prisma.storeMenuItem.create({
            data: { ...item, isActive: true },
          });
          menuCreated++;
        }
      }
    }

    let productsCreated = 0;
    let productsSkipped = 0;
    if (seedProducts) {
      for (const cat of categoryIds) {
        const samples = getSampleProductsForCategory(cat.slug, cat.name);
        for (const sample of samples) {
          const sku = `DEMO-${cat.slug.toUpperCase().replace(/-/g, '_')}-${sample.skuSuffix}`;
          const exists = await prisma.product.findUnique({ where: { sku } });
          if (exists) {
            productsSkipped++;
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
          productsCreated++;
        }
      }
    }

    return NextResponse.json({
      message: 'Store defaults applied',
      categoriesCreated,
      categoriesUpdated,
      menuCreated,
      productsCreated,
      productsSkipped,
      totalCategories: categoryIds.length,
    });
  } catch (error) {
    console.error('Seed store defaults error:', error);
    return NextResponse.json({ error: getSeedDefaultsErrorMessage(error) }, { status: 500 });
  }
}
