import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id)
  const items = await prisma.orderItem.findMany({
    where: { orderId: id },
    select: { id: true, quantity: true, flavor: { select: { name: true, code: true } } },
    orderBy: { id: 'asc' }
  })
  return NextResponse.json(items)
}
