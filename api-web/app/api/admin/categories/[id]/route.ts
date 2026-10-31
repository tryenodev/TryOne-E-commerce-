import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { upsertMenuForCategory } from '@/lib/sync-store-menu';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.icon !== undefined) data.icon = String(body.icon).trim() || '🛍️';
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
    if (body.isVisible !== undefined) data.isVisible = Boolean(body.isVisible);
    if (body.slug !== undefined) {
      const slug = slugify(String(body.slug));
      const existing = await prisma.category.findFirst({
        where: { slug, NOT: { id: params.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
      }
      data.slug = slug;
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
    });

    let menuSynced = false;
    let menuSyncWarning: string | null = null;
    try {
      if (category.isVisible) {
        await upsertMenuForCategory(category);
        menuSynced = true;
      } else {
        const href = `/customer/products?category=${category.id}`;
        await prisma.storeMenuItem.updateMany({ where: { href }, data: { isActive: false } });
      }
    } catch (menuError) {
      console.error('Category updated but menu sync failed:', menuError);
      menuSyncWarning = 'Category updated, but menu sync failed. Use "Sync menu from categories".';
    }

    return NextResponse.json(
      { category, menuSynced, ...(menuSyncWarning ? { menuSyncWarning } : {}) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const count = await prisma.product.count({ where: { categoryId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} product(s) use this category` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
