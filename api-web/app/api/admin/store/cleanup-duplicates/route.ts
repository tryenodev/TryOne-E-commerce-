import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';

/** Remove duplicate menu rows (same href) and hidden duplicate category names. */
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = await prisma.storeMenuItem.findMany({ orderBy: { createdAt: 'asc' } });
    const seenHref = new Set<string>();
    let menuRemoved = 0;
    for (const item of items) {
      const key = item.href.trim().toLowerCase();
      if (seenHref.has(key)) {
        await prisma.storeMenuItem.delete({ where: { id: item.id } });
        menuRemoved++;
      } else {
        seenHref.add(key);
      }
    }

    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    const seenNames = new Set<string>();
    let categoriesHidden = 0;
    for (const cat of categories) {
      const key = cat.name.trim().toLowerCase();
      if (seenNames.has(key)) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { isVisible: false },
        });
        categoriesHidden++;
      } else {
        seenNames.add(key);
      }
    }

    return NextResponse.json({
      message: 'Cleanup complete',
      menuRemoved,
      categoriesHidden,
    });
  } catch (error) {
    console.error('Cleanup duplicates error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
