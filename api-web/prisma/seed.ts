import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_EXTRA_MENU, DEFAULT_STORE_CATEGORIES } from '../lib/store-defaults';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users with hashed passwords
  console.log('Creating admin accounts...');

  // Admin accounts (CANNOT be created via public signup)
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@tryeno-one.com' },
    update: {},
    create: {
      email: 'admin@tryeno-one.com',
      password: await bcrypt.hash('Admin@123', 12),
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'john.admin@tryeno-one.com' },
    update: {},
    create: {
      email: 'john.admin@tryeno-one.com',
      password: await bcrypt.hash('JohnAdmin@456', 12),
      name: 'John Anderson',
      role: 'ADMIN',
    },
  });

  const admin3 = await prisma.user.upsert({
    where: { email: 'sarah.admin@tryeno-one.com' },
    update: {},
    create: {
      email: 'sarah.admin@tryeno-one.com',
      password: await bcrypt.hash('SarahAdmin@789', 12),
      name: 'Sarah Wilson',
      role: 'ADMIN',
    },
  });

  console.log('Created admin accounts:', { admin1, admin2, admin3 });

  // Staff accounts
  console.log('Creating staff accounts...');

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@tryeno-one.com' },
    update: {},
    create: {
      email: 'staff@tryeno-one.com',
      password: await bcrypt.hash('Staff@123', 12),
      name: 'Staff User',
      role: 'STAFF',
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'mike.staff@tryeno-one.com' },
    update: {},
    create: {
      email: 'mike.staff@tryeno-one.com',
      password: await bcrypt.hash('MikeStaff@456', 12),
      name: 'Mike Johnson',
      role: 'STAFF',
    },
  });

  console.log('Created staff accounts:', { staff1, staff2 });

  // Customer accounts
  console.log('Creating customer accounts...');

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@tryeno-one.com' },
    update: {},
    create: {
      email: 'customer@tryeno-one.com',
      password: await bcrypt.hash('Customer@123', 12),
      name: 'Customer User',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'emma.customer@tryeno-one.com' },
    update: {},
    create: {
      email: 'emma.customer@tryeno-one.com',
      password: await bcrypt.hash('EmmaCustomer@456', 12),
      name: 'Emma Davis',
      role: 'CUSTOMER',
    },
  });

  console.log('Created customer accounts:', { customer1, customer2 });

  // Store categories (customer storefront)
  const savedCategories: { id: string; slug: string; name: string; sortOrder: number }[] = [];
  for (const cat of DEFAULT_STORE_CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isVisible: true,
      },
    });
    savedCategories.push(saved);
  }

  const electronics = savedCategories.find((c) => c.slug === 'electronics')!;
  const fashion = savedCategories.find((c) => c.slug === 'fashion')!;

  console.log(`Seeded ${savedCategories.length} categories`);

  for (const cat of savedCategories) {
    const href = `/customer/products?category=${cat.id}`;
    const existing = await prisma.storeMenuItem.findFirst({ where: { href } });
    if (!existing) {
      await prisma.storeMenuItem.create({
        data: {
          label: cat.name,
          href,
          sortOrder: cat.sortOrder,
          isActive: true,
          location: 'HEADER',
        },
      });
    }
  }

  for (const item of DEFAULT_EXTRA_MENU) {
    const existing = await prisma.storeMenuItem.findFirst({
      where: { label: item.label, href: item.href },
    });
    if (!existing) {
      await prisma.storeMenuItem.create({ data: { ...item, isActive: true } });
    }
  }

  console.log('Seeded store menu items');

  // Create demo products
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      costPrice: 650.00,
      stock: 10,
      sku: 'LAPTOP-001',
      categoryId: electronics.id,
      images: ['/images/laptop.jpg'],
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'T-Shirt',
      description: 'Cotton t-shirt',
      price: 19.99,
      costPrice: 8.50,
      stock: 50,
      sku: 'TSHIRT-001',
      categoryId: fashion.id,
      images: ['/images/tshirt.jpg'],
    },
  });

  console.log('Created products:', { product1, product2 });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
