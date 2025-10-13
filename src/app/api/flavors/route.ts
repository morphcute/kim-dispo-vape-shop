import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { name, code, stock, brandId } = await req.json()
  if (!name || !code || !brandId) return NextResponse.json({ error: 'name/code/brandId required' }, { status: 400 })
  const created = await prisma.flavor.create({
    data: { name, code, stock: Number(stock ?? 0), brandId: Number(brandId) }
  })
  return NextResponse.json(created, { status: 201 })
}
