import { PrismaClient } from '@prisma/client';
import { DEFAULT_STORE_CATEGORIES } from '../lib/store-defaults';
import { getSampleProductsForCategory } from '../lib/store-sample-products';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating Categories & Products with Real Images ---');

  // 1. Update categories
  for (const cat of DEFAULT_STORE_CATEGORIES) {
    const updated = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
    });
    console.log(`Updated category: ${updated.name} -> ${updated.icon}`);
  }

  // 2. Fetch all categories
  const categories = await prisma.category.findMany();

  // 3. Insert or update products with real images
  let totalProducts = 0;
  for (const cat of categories) {
    const samples = getSampleProductsForCategory(cat.slug, cat.name);
    for (const sample of samples) {
      const sku = `PROD-${cat.slug.toUpperCase().replace(/-/g, '_')}-${sample.skuSuffix}`;
      await prisma.product.upsert({
        where: { sku },
        update: {
          name: sample.name,
          description: sample.description,
          price: sample.price,
          costPrice: sample.costPrice,
          stock: sample.stock,
          images: sample.images,
          categoryId: cat.id,
          isActive: true,
        },
        create: {
          name: sample.name,
          description: sample.description,
          price: sample.price,
          costPrice: sample.costPrice,
          stock: sample.stock,
          sku,
          images: sample.images,
          categoryId: cat.id,
          isActive: true,
        },
      });
      totalProducts++;
    }
  }

  // Also verify baseline products
  const electronics = categories.find((c) => c.slug === 'electronics');
  const fashion = categories.find((c) => c.slug === 'fashion');

  if (electronics) {
    await prisma.product.upsert({
      where: { sku: 'LAPTOP-001' },
      update: { images: ['/images/laptop.jpg'], isActive: true },
      create: {
        name: 'Laptop Ultra 15',
        description: 'High-performance laptop with M-series processor & Retina display',
        price: 999.99,
        costPrice: 650.00,
        stock: 15,
        sku: 'LAPTOP-001',
        categoryId: electronics.id,
        images: ['/images/laptop.jpg'],
        isActive: true,
      },
    });

    await prisma.product.upsert({
      where: { sku: 'MOBILE-001' },
      update: { images: ['/images/mobile.jpg'], isActive: true },
      create: {
        name: 'Smartphone 5G Pro',
        description: 'Flagship 5G smartphone with AMOLED display & high-resolution camera',
        price: 19999.00,
        costPrice: 14500.00,
        stock: 25,
        sku: 'MOBILE-001',
        categoryId: electronics.id,
        images: ['/images/mobile.jpg'],
        isActive: true,
      },
    });
  }

  if (fashion) {
    await prisma.product.upsert({
      where: { sku: 'TSHIRT-001' },
      update: { images: ['/images/tshirt.jpg'], isActive: true },
      create: {
        name: 'Classic Cotton T-Shirt',
        description: 'Breathable combed cotton regular fit crew neck t-shirt',
        price: 499.00,
        costPrice: 220.00,
        stock: 50,
        sku: 'TSHIRT-001',
        categoryId: fashion.id,
        images: ['/images/tshirt.jpg'],
        isActive: true,
      },
    });
  }

  const finalCount = await prisma.product.count();
  console.log(`Done! Total products in store: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
