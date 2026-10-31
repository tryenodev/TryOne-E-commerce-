/** Default storefront categories & menu — used by seed and admin "quick setup". */

export type DefaultCategory = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
};

export const DEFAULT_STORE_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Phones, laptops, gadgets & accessories',
    icon: '📱',
    sortOrder: 1,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear & accessories',
    icon: '👗',
    sortOrder: 2,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, decor & appliances',
    icon: '🏠',
    sortOrder: 3,
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup & personal care',
    icon: '💄',
    sortOrder: 4,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Fitness, outdoor & sports gear',
    icon: '⚽',
    sortOrder: 5,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books, stationery & learning',
    icon: '📚',
    sortOrder: 6,
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Daily essentials & food items',
    icon: '🛒',
    sortOrder: 7,
  },
  {
    name: 'Toys & Baby',
    slug: 'toys-baby',
    description: 'Toys, games & baby products',
    icon: '🧸',
    sortOrder: 8,
  },
];

export type DefaultMenuItem = {
  label: string;
  href: string;
  sortOrder: number;
  location: 'HEADER' | 'FOOTER' | 'BOTH';
  categorySlug?: string;
};

/** Extra menu rows (non-category). Category-linked items are built from DB ids. */
export const DEFAULT_EXTRA_MENU: Omit<DefaultMenuItem, 'categorySlug'>[] = [
  { label: 'Deals', href: '/customer/products', sortOrder: 20, location: 'HEADER' },
  { label: 'Pay Invoice', href: '/customer/simple-invoice', sortOrder: 1, location: 'FOOTER' },
  { label: 'Help & Support', href: '/customer/profile', sortOrder: 2, location: 'FOOTER' },
];
