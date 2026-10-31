import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getApiUser } from '@/lib/api-session';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { HARDCODED_CATEGORIES, HARDCODED_PRODUCTS } from '@/lib/hardcoded-store-data';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { upsertMenuForCategory } from '@/lib/sync-store-menu';

export const dynamic = 'force-dynamic';

function getCategoryErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021' || error.code === 'P2022') {
      return 'Database schema is outdated on live. Run Prisma migration and redeploy.';
    }
    if (error.code === 'P1001') {
      return 'Database is unreachable. Check DATABASE_URL / DIRECT_URL on Vercel.';
    }
    if (error.code === 'P2002') {
      return 'A category with this name or slug already exists.';
    }
    return `Database error (${error.code}): ${error.message}`;
  }

  if (error instanceof Error && /database url|p1013/i.test(error.message)) {
    return 'Invalid database URL in Vercel env. Fix DATABASE_URL / DIRECT_URL.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to create category';
}

export async function GET(request: NextRequest) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (categories.length === 0) {
      const fallback = HARDCODED_CATEGORIES.map((cat) => ({
        ...cat,
        _count: {
          products: HARDCODED_PRODUCTS.filter((p) => p.categoryId === cat.id).length,
        },
      }));
      return NextResponse.json({ categories: fallback, source: 'hardcoded' }, { status: 200 });
    }

    return NextResponse.json({ categories, source: 'database' }, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    const fallback = HARDCODED_CATEGORIES.map((cat) => ({
      ...cat,
      _count: {
        products: HARDCODED_PRODUCTS.filter((p) => p.categoryId === cat.id).length,
      },
    }));
    return NextResponse.json({ categories: fallback, source: 'hardcoded' }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, sortOrder, isVisible, slug: rawSlug } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const baseSlug = slugify(rawSlug || name);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug,
        icon: icon?.trim() || '🛍️',
        sortOrder: Number(sortOrder) || 0,
        isVisible: isVisible !== false,
      },
    });

    let menuSynced = false;
    let menuSyncWarning: string | null = null;
    if (category.isVisible) {
      try {
        await upsertMenuForCategory(category);
        menuSynced = true;
      } catch (menuError) {
        console.error('Category created but menu sync failed:', menuError);
        menuSyncWarning = 'Category created, but menu sync failed. Use "Sync menu from categories".';
      }
    }

    return NextResponse.json(
      { category, menuSynced, ...(menuSyncWarning ? { menuSyncWarning } : {}) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: getCategoryErrorMessage(error) }, { status: 500 });
  }
}
