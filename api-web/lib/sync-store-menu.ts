import { prisma } from '@/lib/prisma';
import { DEFAULT_EXTRA_MENU } from '@/lib/store-defaults';

export type SyncMenuResult = {
  created: number;
  updated: number;
  total: number;
  extrasCreated: number;
};

/** Upsert header menu links for all visible categories (+ optional default extras). */
export async function syncMenuFromCategories(options?: {
  includeExtras?: boolean;
}): Promise<SyncMenuResult> {
  const includeExtras = options?.includeExtras ?? false;

  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  let created = 0;
  let updated = 0;

  for (const cat of categories) {
    const href = `/customer/products?category=${cat.id}`;
    const existing = await prisma.storeMenuItem.findFirst({ where: { href } });

    if (existing) {
      await prisma.storeMenuItem.update({
        where: { id: existing.id },
        data: { label: cat.name, isActive: true, sortOrder: cat.sortOrder, location: 'HEADER' },
      });
      updated++;
    } else {
      await prisma.storeMenuItem.create({
        data: {
          label: cat.name,
          href,
          sortOrder: cat.sortOrder,
          isActive: true,
          location: 'HEADER',
        },
      });
      created++;
    }
  }

  let extrasCreated = 0;
  if (includeExtras) {
    for (const item of DEFAULT_EXTRA_MENU) {
      const existing = await prisma.storeMenuItem.findFirst({
        where: { label: item.label, href: item.href },
      });
      if (!existing) {
        await prisma.storeMenuItem.create({
          data: { ...item, isActive: true },
        });
        extrasCreated++;
      }
    }
  }

  return { created, updated, total: categories.length, extrasCreated };
}

/** Create or update a single header menu link for a category. */
export async function upsertMenuForCategory(category: {
  id: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
}) {
  if (!category.isVisible) return;

  const href = `/customer/products?category=${category.id}`;
  const existing = await prisma.storeMenuItem.findFirst({ where: { href } });

  if (existing) {
    await prisma.storeMenuItem.update({
      where: { id: existing.id },
      data: { label: category.name, isActive: true, sortOrder: category.sortOrder, location: 'HEADER' },
    });
  } else {
    await prisma.storeMenuItem.create({
      data: {
        label: category.name,
        href,
        sortOrder: category.sortOrder,
        isActive: true,
        location: 'HEADER',
      },
    });
  }
}
