import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

/** List flavors for a brand (PUBLIC - for customers) */
export async function GET(req: Request, ctx: Ctx) {
  // Remove admin check for GET - customers need to see flavors
  const { id } = await ctx.params;
  const flavors = await prisma.flavor.findMany({
    where: { brandId: Number(id) },
    orderBy: { id: "asc" },
    select: { 
      id: true, 
      name: true, 
      code: true, 
      stock: true,
      costPrice: true,
      sellingPrice: true
    },
  });
  return NextResponse.json(flavors);
}

/** Create flavor under a brand (admin) */
export async function POST(req: Request, ctx: Ctx) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const { name, code, stock, costPrice, sellingPrice } = await req.json();

  if (!name || !code) return new NextResponse("Missing name/code", { status: 400 });
  
  const stockNum = Number(stock ?? 0);
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    return new NextResponse("Invalid stock", { status: 400 });
  }

  const costPriceNum = Number(costPrice ?? 0);
  const sellingPriceNum = Number(sellingPrice ?? 0);

  const created = await prisma.flavor.create({
    data: { 
      name, 
      code, 
      stock: stockNum,
      costPrice: costPriceNum,
      sellingPrice: sellingPriceNum,
      brandId: Number(id) 
    },
    select: { 
      id: true, 
      name: true, 
      code: true, 
      stock: true,
      costPrice: true,
      sellingPrice: true
    },
  });
  return NextResponse.json(created, { status: 201 });
}