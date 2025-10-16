import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(req: Request) {
  // Use the centralized admin auth
  if (!isAdmin(req)) {
    console.error("❌ Unauthorized access attempt to overview");
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const [categories, orders] = await Promise.all([
      prisma.category.findMany({
        orderBy: { id: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      prisma.order.findMany({
        orderBy: { id: 'desc' },
        select: {
          id: true,
          customer: true,
          status: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              flavor: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
    ]);

    console.log(`✅ Successfully fetched overview data: ${categories.length} categories, ${orders.length} orders`);
    return NextResponse.json({ categories, orders });
    
  } catch (error) {
    console.error("❌ Error fetching overview data:", error);
    return new NextResponse('Server error', { status: 500 });
  }
}