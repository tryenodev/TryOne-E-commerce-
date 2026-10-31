import { prisma } from '@/lib/prisma';
import { HARDCODED_CATEGORIES, HARDCODED_PRODUCTS } from '@/lib/hardcoded-store-data';

type CheckoutItem = {
  productId: string;
  quantity: number;
  price: number;
};

/**
 * Ensures product ids from cart exist in DB.
 * If hardcoded fallback products are used in UI, we auto-upsert them for checkout.
 */
export async function ensureCheckoutProducts(items: CheckoutItem[]) {
  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  if (ids.length === 0) return;

  const existing = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((p) => p.id));
  const missingIds = ids.filter((id) => !existingIds.has(id));
  if (missingIds.length === 0) return;

  const hardcodedById = new Map(HARDCODED_PRODUCTS.map((p) => [p.id, p]));
  const required = missingIds
    .map((id) => hardcodedById.get(id))
    .filter((p): p is (typeof HARDCODED_PRODUCTS)[number] => Boolean(p));
  if (required.length === 0) return;

  const requiredCategoryIds = [...new Set(required.map((p) => p.category.id))];
  for (const categoryId of requiredCategoryIds) {
    const cat = HARDCODED_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) continue;
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
    });
  }

  for (const p of required) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        sku: p.sku,
        images: p.images,
        isActive: true,
        categoryId: p.category.id,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        sku: p.sku,
        images: p.images,
        isActive: true,
        categoryId: p.category.id,
      },
    });
  }
}

