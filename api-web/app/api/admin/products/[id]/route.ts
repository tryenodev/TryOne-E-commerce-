import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.description !== undefined) data.description = body.description?.trim() || '';
    if (body.price !== undefined) data.price = parseFloat(String(body.price));
    if (body.costPrice !== undefined) {
      data.costPrice = body.costPrice === '' || body.costPrice == null ? null : parseFloat(String(body.costPrice));
    }
    if (body.stock !== undefined) data.stock = parseInt(String(body.stock), 10) || 0;
    if (body.categoryId !== undefined) data.categoryId = String(body.categoryId);
    if (body.sku !== undefined) data.sku = body.sku?.trim() || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.imageUrl !== undefined) {
      const url = String(body.imageUrl).trim();
      data.images = url ? [url] : [];
    }
    if (body.images !== undefined && Array.isArray(body.images)) {
      data.images = body.images.filter((u: string) => u?.trim());
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const err = error as { code?: string };
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
