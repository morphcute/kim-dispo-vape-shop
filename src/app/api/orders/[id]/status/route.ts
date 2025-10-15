import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/adminAuth'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  try {
    const { id } = await params;
    const { status } = await req.json() as { status: 'PREPARING' | 'SHIPPED' | 'DELIVERED' }
    
    const updated = await prisma.order.update({ 
      where: { id: Number(id) }, 
      data: { status } 
    });
    
    return NextResponse.json({ 
      id: updated.id, 
      status: updated.status,
      message: `Order #${id} status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}