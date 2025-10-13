import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { name, categoryId } = await req.json()
  if (!name || !categoryId) return NextResponse.json({ error: 'name/categoryId required' }, { status: 400 })
  const created = await prisma.brand.create({ data: { name, categoryId: Number(categoryId) } })
  return NextResponse.json(created, { status: 201 })
}
