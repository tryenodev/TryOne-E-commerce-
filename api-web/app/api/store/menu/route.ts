import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { HARDCODED_MENU_ITEMS } from '@/lib/hardcoded-store-data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureStoreSchema();
    const items = await prisma.storeMenuItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: {
        id: true,
        label: true,
        href: true,
        sortOrder: true,
        location: true,
      },
    });

    if (items.length === 0) {
      return NextResponse.json({ items: HARDCODED_MENU_ITEMS, source: 'hardcoded' }, { status: 200 });
    }

    return NextResponse.json({ items, source: 'database' }, { status: 200 });
  } catch (error) {
    console.error('Error fetching store menu:', error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2022')
    ) {
      return NextResponse.json(
        {
          items: HARDCODED_MENU_ITEMS,
          source: 'hardcoded',
          warning: 'Menu table is not ready. Showing hardcoded menu.',
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ items: HARDCODED_MENU_ITEMS, source: 'hardcoded' }, { status: 200 });
  }
}
