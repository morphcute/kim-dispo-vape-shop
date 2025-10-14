import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/adminAuth'

type Params = { params: { id: string } }

export async function PUT(req: Request, { params }: Params) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  const id = Number(params.id)
  const { status } = await req.json() as { status: 'PREPARING'|'SHIPPED'|'DELIVERED' }
  const updated = await prisma.order.update({ where: { id }, data: { status } })
  return NextResponse.json({ id: updated.id, status: updated.status })
}