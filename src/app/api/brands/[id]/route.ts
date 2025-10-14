import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// GET - Public access for storefront
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
      include: {
        category: true
      }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

// DELETE - Admin only
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  await prisma.brand.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}