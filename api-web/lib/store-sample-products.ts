/** Demo products per category — used by admin "Add sample products". */

export type SampleProduct = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  skuSuffix: string;
  images: string[];
};

const BY_SLUG: Record<string, SampleProduct[]> = {
  electronics: [
    {
      name: 'Wireless Earbuds Pro',
      description: 'Active noise cancellation, 30hr battery life, fast charging',
      price: 2499,
      costPrice: 1200,
      stock: 45,
      skuSuffix: 'EARBUDS',
      images: ['/images/products/earbuds.jpg'],
    },
    {
      name: 'Smart LED TV 43"',
      description: '4K Ultra HD, Android TV, Dolby Audio with bezel-less display',
      price: 28999,
      costPrice: 22000,
      stock: 12,
      skuSuffix: 'TV43',
      images: ['/images/products/tv.jpg'],
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof speaker with deep 20W bass',
      price: 1999,
      costPrice: 950,
      stock: 60,
      skuSuffix: 'SPKR',
      images: ['/images/products/speaker.jpg'],
    },
    {
      name: 'Smart Fitness Watch',
      description: 'Heart rate monitor, AMOLED display, 14-day battery life',
      price: 3499,
      costPrice: 1800,
      stock: 35,
      skuSuffix: 'WATCH',
      images: ['/images/products/smartwatch.jpg'],
    },
  ],
  fashion: [
    {
      name: 'Men Cotton T-Shirt',
      description: '100% combed cotton, breathable everyday regular fit',
      price: 499,
      costPrice: 220,
      stock: 120,
      skuSuffix: 'TEE-M',
      images: ['/images/tshirt.jpg'],
    },
    {
      name: 'Running Shoes Pro',
      description: 'Ultra-lightweight mesh, responsive cushioning sole',
      price: 2499,
      costPrice: 1400,
      stock: 35,
      skuSuffix: 'SHOE-W',
      images: ['/images/products/shoes.jpg'],
    },
    {
      name: 'Slim Fit Denim Jeans',
      description: 'Comfort stretch denim with 5-pocket styling',
      price: 1299,
      costPrice: 650,
      stock: 80,
      skuSuffix: 'JEANS',
      images: ['/images/products/jeans.jpg'],
    },
    {
      name: 'Casual Fleece Hoodie',
      description: 'Warm fleece lining with adjustable drawstring hood',
      price: 1499,
      costPrice: 750,
      stock: 40,
      skuSuffix: 'HOODIE',
      images: ['/images/products/hoodie.jpg'],
    },
  ],
  'home-kitchen': [
    {
      name: 'Non-Stick Cookware Set',
      description: 'Hard-anodized 3-piece induction-compatible frying pans',
      price: 3499,
      costPrice: 2100,
      stock: 25,
      skuSuffix: 'COOK',
      images: ['/images/products/cookware.jpg'],
    },
    {
      name: 'Modern LED Table Lamp',
      description: 'Warm ambient glow with 3-level touch dimmer',
      price: 899,
      costPrice: 450,
      stock: 50,
      skuSuffix: 'LAMP',
      images: ['/images/products/lamp.jpg'],
    },
    {
      name: 'Automatic Drip Coffee Maker',
      description: 'Brew 12 cups with programmable timer and keep-warm plate',
      price: 2799,
      costPrice: 1500,
      stock: 20,
      skuSuffix: 'COFFEE',
      images: ['/images/products/coffeemaker.jpg'],
    },
  ],
  beauty: [
    {
      name: 'Vitamin C Brightening Serum',
      description: 'Antioxidant serum with Hyaluronic acid, 30ml',
      price: 599,
      costPrice: 280,
      stock: 70,
      skuSuffix: 'SERUM',
      images: ['/images/products/serum.jpg'],
    },
    {
      name: 'Matte Liquid Lipstick',
      description: 'Velvet smooth formula, 12-hour smudge-proof wear',
      price: 799,
      costPrice: 350,
      stock: 55,
      skuSuffix: 'LIP',
      images: ['/images/products/lipstick.jpg'],
    },
    {
      name: 'Luxury Eau De Parfum',
      description: 'Elegant floral and woody notes, 100ml spray',
      price: 1899,
      costPrice: 950,
      stock: 30,
      skuSuffix: 'PERFUME',
      images: ['/images/products/perfume.jpg'],
    },
  ],
  sports: [
    {
      name: 'Anti-Slip Yoga Mat 6mm',
      description: 'Eco-friendly TPE material with free carry strap',
      price: 899,
      costPrice: 420,
      stock: 40,
      skuSuffix: 'YOGA',
      images: ['/images/products/yoga-mat.jpg'],
    },
    {
      name: 'Hex Dumbbell Set (Pair)',
      description: 'Rubber-encased cast iron with knurled steel grip',
      price: 1499,
      costPrice: 800,
      stock: 30,
      skuSuffix: 'DUMB',
      images: ['/images/products/dumbbell.jpg'],
    },
    {
      name: 'Match Grade Football',
      description: 'Hand-stitched synthetic leather, official size 5',
      price: 799,
      costPrice: 380,
      stock: 45,
      skuSuffix: 'BALL',
      images: ['/images/products/football.jpg'],
    },
  ],
  books: [
    {
      name: 'Atomic Habits (Paperback)',
      description: 'An Easy & Proven Way to Build Good Habits by James Clear',
      price: 399,
      costPrice: 220,
      stock: 65,
      skuSuffix: 'BOOK1',
      images: ['/images/products/book.jpg'],
    },
    {
      name: 'Premium Hardcover Notebook A5',
      description: '192 dotted pages, 120gsm bleed-proof paper with ribbon marker',
      price: 349,
      costPrice: 160,
      stock: 90,
      skuSuffix: 'NOTE',
      images: ['/images/products/notebook.jpg'],
    },
  ],
  grocery: [
    {
      name: 'Dark Roast Coffee Beans 500g',
      description: '100% Arabica artisanal whole beans with notes of caramel',
      price: 549,
      costPrice: 310,
      stock: 60,
      skuSuffix: 'COFFEEB',
      images: ['/images/products/coffee-beans.jpg'],
    },
    {
      name: 'Extra Virgin Olive Oil 1L',
      description: 'First cold pressed, rich in antioxidants and healthy fats',
      price: 899,
      costPrice: 620,
      stock: 40,
      skuSuffix: 'OIL',
      images: ['/images/products/olive-oil.jpg'],
    },
    {
      name: 'Premium Mixed Dry Fruits 500g',
      description: 'Crisp California almonds, cashews, walnuts, and Afghan raisins',
      price: 649,
      costPrice: 420,
      stock: 55,
      skuSuffix: 'NUTS',
      images: ['/images/products/dry-fruits.jpg'],
    },
  ],
  'toys-baby': [
    {
      name: 'Classic Wooden Building Blocks',
      description: '100-piece natural wood geometric shapes, non-toxic colors',
      price: 799,
      costPrice: 400,
      stock: 45,
      skuSuffix: 'BLOCK',
      images: ['/images/products/blocks.jpg'],
    },
    {
      name: 'Soft Plush Teddy Bear',
      description: 'Super-soft huggable plush, child-safe embroidered eyes',
      price: 499,
      costPrice: 250,
      stock: 60,
      skuSuffix: 'TEDDY',
      images: ['/images/products/teddy.jpg'],
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
    images: [],
  },
  {
    name: 'Value Pack',
    description: 'Great value for everyday use',
    price: 599,
    costPrice: 350,
    stock: 75,
    skuSuffix: 'ITEM2',
    images: [],
  },
  {
    name: 'Premium Choice',
    description: 'Premium quality selection',
    price: 1999,
    costPrice: 1200,
    stock: 30,
    skuSuffix: 'ITEM3',
    images: [],
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
