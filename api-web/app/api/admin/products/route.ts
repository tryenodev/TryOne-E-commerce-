import { NextRequest, NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all products (Admin)
 *     description: Returns a list of all products (including inactive) for admin management. Requires ADMIN role.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of products
 *       403:
 *         description: Unauthorized
 */
// GET - List all products (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new product
 *     description: Creates a new product. Requires ADMIN role.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               sku:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation failed or SKU exists
 *       403:
 *         description: Unauthorized
 */
// POST - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request);

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      costPrice,
      stock,
      categoryId,
      sku,
      imageUrl,
      images,
      isActive,
    } = body;

    if (!name?.trim() || price === undefined || price === '' || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    let imageList: string[] = [];
    if (Array.isArray(images)) {
      imageList = images.map((u: string) => String(u).trim()).filter(Boolean);
    } else if (imageUrl?.trim()) {
      imageList = [String(imageUrl).trim()];
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description?.trim() || '',
        price: parseFloat(String(price)),
        costPrice: costPrice ? parseFloat(String(costPrice)) : null,
        stock: parseInt(String(stock), 10) || 0,
        categoryId,
        sku: sku?.trim() || null,
        images: imageList,
        isActive: isActive !== false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
