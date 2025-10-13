import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const mustToken = process.env.ADMIN_TOKEN ?? 'test';

export async function GET(req: Request) {
  const token = req.headers.get('x-admin-token') ?? '';
  if (token !== mustToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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

  return NextResponse.json({ categories, orders });
}
