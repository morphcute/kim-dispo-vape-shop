import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const mustToken = process.env.ADMIN_TOKEN ?? 'test';

export async function POST(req: Request) {
  const token = req.headers.get('x-admin-token') ?? '';
  if (token !== mustToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Upsert helper
  const upsertCategory = (slug: string, name: string) =>
    prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });

  // Base categories
  const v1   = await upsertCategory('version-1', 'VERSION 1');
  const v2   = await upsertCategory('version-2', 'VERSION 2');
  const disp = await upsertCategory('disposable-vape', 'DISPOSABLE VAPE');

  // Brands under VERSION 2 (example)
  const xb = await prisma.brand.upsert({
    where: { id: 1 }, // deterministic id so we don’t clone
    update: { name: 'XBLACK ELITE 12000', categoryId: v2.id },
    create: { name: 'XBLACK ELITE 12000', categoryId: v2.id },
  });

  const frost = await prisma.brand.upsert({
    where: { id: 2 },
    update: { name: 'FROST ELITE 20000', categoryId: v2.id },
    create: { name: 'FROST ELITE 20000', categoryId: v2.id },
  });

  // Flavors for XBLACK
  await prisma.$transaction([
    prisma.flavor.upsert({
      where: { id: 1 },
      update: { name: 'BLACK CURRANT', code: 'BLACK WAVE', stock: 2, isActive: true, brandId: xb.id },
      create: { name: 'BLACK CURRANT', code: 'BLACK WAVE', stock: 2, isActive: true, brandId: xb.id },
    }),
    prisma.flavor.upsert({
      where: { id: 2 },
      update: { name: 'MIXED BERRIES', code: 'VERY MORE', stock: 4, isActive: true, brandId: xb.id },
      create: { name: 'MIXED BERRIES', code: 'VERY MORE', stock: 4, isActive: true, brandId: xb.id },
    }),
    prisma.flavor.upsert({
      where: { id: 3 },
      update: { name: 'STRAWBERRY', code: 'VERY BAGUIO', stock: 9, isActive: true, brandId: xb.id },
      create: { name: 'STRAWBERRY', code: 'VERY BAGUIO', stock: 9, isActive: true, brandId: xb.id },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
