import { getSampleProductsForCategory } from '@/lib/store-sample-products';
import { DEFAULT_EXTRA_MENU, DEFAULT_STORE_CATEGORIES } from '@/lib/store-defaults';

export const HARDCODED_CATEGORIES = DEFAULT_STORE_CATEGORIES.map((cat) => ({
  id: `hc-${cat.slug}`,
  name: cat.name,
  slug: cat.slug,
  description: cat.description,
  icon: cat.icon,
  sortOrder: cat.sortOrder,
  isVisible: true,
}));

export const HARDCODED_MENU_ITEMS = [
  ...HARDCODED_CATEGORIES.map((cat) => ({
    id: `hc-menu-${cat.slug}`,
    label: cat.name,
    href: `/customer/products?category=${cat.id}`,
    sortOrder: cat.sortOrder,
    location: 'HEADER',
  })),
  ...DEFAULT_EXTRA_MENU.map((item, idx) => ({
    id: `hc-extra-${idx + 1}`,
    label: item.label,
    href: item.href,
    sortOrder: 100 + idx,
    location: item.location,
  })),
];

export const HARDCODED_PRODUCTS = HARDCODED_CATEGORIES.flatMap((cat) =>
  getSampleProductsForCategory(cat.slug, cat.name).map((sample, idx) => ({
    id: `hc-prod-${cat.slug}-${idx + 1}`,
    name: sample.name,
    description: sample.description,
    price: sample.price,
    costPrice: sample.costPrice,
    stock: sample.stock,
    sku: `HC-${cat.slug.toUpperCase().replace(/-/g, '_')}-${sample.skuSuffix}`,
    images: [] as string[],
    isActive: true,
    createdAt: new Date().toISOString(),
    categoryId: cat.id,
    category: {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
    },
  }))
);

