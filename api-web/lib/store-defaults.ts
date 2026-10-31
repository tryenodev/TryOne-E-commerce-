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
    icon: '/images/categories/electronics.jpg',
    sortOrder: 1,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear & accessories',
    icon: '/images/categories/fashion.jpg',
    sortOrder: 2,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Furniture, decor & appliances',
    icon: '/images/categories/home.jpg',
    sortOrder: 3,
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare, makeup & personal care',
    icon: '/images/categories/beauty.jpg',
    sortOrder: 4,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Fitness, outdoor & sports gear',
    icon: '/images/categories/sports.jpg',
    sortOrder: 5,
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books, stationery & learning',
    icon: '/images/categories/books.jpg',
    sortOrder: 6,
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Daily essentials & food items',
    icon: '/images/categories/grocery.jpg',
    sortOrder: 7,
  },
  {
    name: 'Toys & Baby',
    slug: 'toys-baby',
    description: 'Toys, games & baby products',
    icon: '/images/categories/toys.jpg',
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
