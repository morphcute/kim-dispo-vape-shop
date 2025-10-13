import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const flavors = await prisma.flavor.findMany({
    where: { brandId: Number(id) },
    orderBy: { id: "asc" },
    select: { id: true, name: true, code: true, stock: true },
  });
  return NextResponse.json(flavors);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const { name, code, stock } = await req.json();
  const created = await prisma.flavor.create({
    data: { name, code, stock: Number(stock) || 0, brandId: Number(id) },
  });
  return NextResponse.json(created, { status: 201 });
}
