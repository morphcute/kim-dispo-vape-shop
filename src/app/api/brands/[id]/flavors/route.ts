import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// GET - Public access for storefront
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const flavors = await prisma.flavor.findMany({
      where: { 
        brandId: Number(id),
        stock: { gt: 0 } // Only show flavors with stock
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(flavors);
  } catch (error) {
    console.error('Error fetching flavors:', error);
    return NextResponse.json({ error: 'Failed to fetch flavors' }, { status: 500 });
  }
}

// POST - Admin only
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  const { id } = await ctx.params;
  const body = await req.json();

  const created = await prisma.flavor.create({
    data: {
      brandId: Number(id),
      name: body.name,
      code: body.code,
      stock: body.stock ?? 0,
      costPrice: body.costPrice ?? 0,
      sellingPrice: body.sellingPrice ?? 0,
    },
  });

  return NextResponse.json(created);
}