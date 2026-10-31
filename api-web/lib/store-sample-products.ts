/** Demo products per category — used by admin "Add sample products". */

export type SampleProduct = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  skuSuffix: string;
};

const BY_SLUG: Record<string, SampleProduct[]> = {
  electronics: [
    {
      name: 'Wireless Earbuds Pro',
      description: 'ANC, 30hr battery, fast charge',
      price: 2499,
      costPrice: 1200,
      stock: 45,
      skuSuffix: 'EARBUDS',
    },
    {
      name: 'Smart LED TV 43"',
      description: '4K UHD, Android TV, Dolby Audio',
      price: 28999,
      costPrice: 22000,
      stock: 12,
      skuSuffix: 'TV43',
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof 20W bass',
      price: 1999,
      costPrice: 950,
      stock: 60,
      skuSuffix: 'SPKR',
    },
  ],
  fashion: [
    {
      name: 'Men Cotton T-Shirt',
      description: 'Regular fit, breathable fabric',
      price: 499,
      costPrice: 220,
      stock: 120,
      skuSuffix: 'TEE-M',
    },
    {
      name: 'Women Running Shoes',
      description: 'Lightweight, cushioned sole',
      price: 2499,
      costPrice: 1400,
      stock: 35,
      skuSuffix: 'SHOE-W',
    },
    {
      name: 'Denim Jeans',
      description: 'Slim fit, stretch denim',
      price: 1299,
      costPrice: 650,
      stock: 80,
      skuSuffix: 'JEANS',
    },
  ],
  'home-kitchen': [
    {
      name: 'Non-Stick Cookware Set',
      description: '5-piece induction compatible',
      price: 3499,
      costPrice: 2100,
      stock: 25,
      skuSuffix: 'COOK',
    },
    {
      name: 'LED Table Lamp',
      description: 'Warm white, touch dimmer',
      price: 899,
      costPrice: 450,
      stock: 50,
      skuSuffix: 'LAMP',
    },
    {
      name: 'Storage Organizer Box',
      description: 'Stackable 3-tier with lids',
      price: 699,
      costPrice: 320,
      stock: 90,
      skuSuffix: 'BOX',
    },
  ],
  beauty: [
    {
      name: 'Vitamin C Face Serum',
      description: 'Brightening, 30ml',
      price: 599,
      costPrice: 280,
      stock: 70,
      skuSuffix: 'SERUM',
    },
    {
      name: 'Matte Lipstick Set',
      description: 'Pack of 4 long-wear shades',
      price: 799,
      costPrice: 350,
      stock: 55,
      skuSuffix: 'LIP',
    },
    {
      name: 'Sunscreen SPF 50',
      description: 'PA+++, non-greasy 100ml',
      price: 449,
      costPrice: 200,
      stock: 100,
      skuSuffix: 'SUN',
    },
  ],
  sports: [
    {
      name: 'Yoga Mat 6mm',
      description: 'Anti-slip, carry strap included',
      price: 899,
      costPrice: 420,
      stock: 40,
      skuSuffix: 'YOGA',
    },
    {
      name: 'Cricket Bat Kashmir Willow',
      description: 'Full size with grip',
      price: 1999,
      costPrice: 1100,
      stock: 18,
      skuSuffix: 'BAT',
    },
    {
      name: 'Gym Dumbbell Set 5kg',
      description: 'Pair with neoprene coating',
      price: 1499,
      costPrice: 800,
      stock: 30,
      skuSuffix: 'DUMB',
    },
  ],
  books: [
    {
      name: 'Atomic Habits (Paperback)',
      description: 'Bestseller self-help',
      price: 399,
      costPrice: 220,
      stock: 65,
      skuSuffix: 'BOOK1',
    },
    {
      name: 'Notebook Pack A5',
      description: 'Ruled, 200 pages x 3',
      price: 299,
      costPrice: 140,
      stock: 110,
      skuSuffix: 'NOTE',
    },
    {
      name: 'Ball Pen Box (10 pcs)',
      description: 'Smooth blue ink',
      price: 149,
      costPrice: 60,
      stock: 200,
      skuSuffix: 'PEN',
    },
  ],
  grocery: [
    {
      name: 'Basmati Rice 5kg',
      description: 'Premium aged long grain',
      price: 649,
      costPrice: 480,
      stock: 75,
      skuSuffix: 'RICE',
    },
    {
      name: 'Extra Virgin Olive Oil 1L',
      description: 'Cold pressed import',
      price: 899,
      costPrice: 620,
      stock: 40,
      skuSuffix: 'OIL',
    },
    {
      name: 'Mixed Dry Fruits 500g',
      description: 'Almonds, cashews, raisins',
      price: 549,
      costPrice: 380,
      stock: 55,
      skuSuffix: 'NUTS',
    },
  ],
  'toys-baby': [
    {
      name: 'Building Blocks Set 100pc',
      description: 'Non-toxic, ages 3+',
      price: 799,
      costPrice: 400,
      stock: 45,
      skuSuffix: 'BLOCK',
    },
    {
      name: 'Soft Teddy Bear',
      description: 'Plush 12 inch, washable',
      price: 499,
      costPrice: 250,
      stock: 60,
      skuSuffix: 'TEDDY',
    },
    {
      name: 'Baby Diapers Pack (M)',
      description: '32 count, rash guard',
      price: 699,
      costPrice: 480,
      stock: 85,
      skuSuffix: 'DIAP',
    },
  ],
};

const GENERIC: SampleProduct[] = [
  {
    name: 'Bestseller Item',
    description: 'Top rated product in this category',
    price: 999,
    costPrice: 600,
    stock: 50,
    skuSuffix: 'ITEM1',
  },
  {
    name: 'Value Pack',
    description: 'Great value for everyday use',
    price: 599,
    costPrice: 350,
    stock: 75,
    skuSuffix: 'ITEM2',
  },
  {
    name: 'Premium Choice',
    description: 'Premium quality selection',
    price: 1999,
    costPrice: 1200,
    stock: 30,
    skuSuffix: 'ITEM3',
  },
];

export function getSampleProductsForCategory(slug: string, categoryName: string): SampleProduct[] {
  const key = slug.toLowerCase();
  if (BY_SLUG[key]) return BY_SLUG[key];

  const n = categoryName.toLowerCase();
  if (n.includes('elect')) return BY_SLUG.electronics;
  if (n.includes('fashion') || n.includes('cloth')) return BY_SLUG.fashion;
  if (n.includes('home') || n.includes('kitchen')) return BY_SLUG['home-kitchen'];
  if (n.includes('beauty')) return BY_SLUG.beauty;
  if (n.includes('sport')) return BY_SLUG.sports;
  if (n.includes('book')) return BY_SLUG.books;
  if (n.includes('grocery') || n.includes('food')) return BY_SLUG.grocery;
  if (n.includes('toy') || n.includes('baby')) return BY_SLUG['toys-baby'];

  return GENERIC.map((p) => ({
    ...p,
    name: `${categoryName} — ${p.name}`,
  }));
}
