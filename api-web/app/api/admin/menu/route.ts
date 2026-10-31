import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = await prisma.storeMenuItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { label, href, sortOrder, isActive, location } = body;

    if (!label?.trim() || !href?.trim()) {
      return NextResponse.json({ error: 'Label and link are required' }, { status: 400 });
    }

    const item = await prisma.storeMenuItem.create({
      data: {
        label: label.trim(),
        href: href.trim(),
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
        location: location || 'HEADER',
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
