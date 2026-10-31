import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { ensureStoreSchema } from '@/lib/ensure-store-schema';
import { syncMenuFromCategories } from '@/lib/sync-store-menu';

export const dynamic = 'force-dynamic';

/**
 * POST — Create/update header menu items for all visible categories.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureStoreSchema();
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const includeExtras = body.includeExtras === true;

    const { created, updated, total, extrasCreated } = await syncMenuFromCategories({
      includeExtras,
    });

    return NextResponse.json({
      message: 'Menu synced from categories',
      created,
      updated,
      total,
      extrasCreated,
    });
  } catch (error) {
    console.error('Sync menu error:', error);
    return NextResponse.json({ error: 'Failed to sync menu' }, { status: 500 });
  }
}
