import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const brands = await prisma.brand.findMany({
    where: { categoryId: Number(id) },
    orderBy: { id: "asc" },
    select: { id: true, name: true, poster: true },
  });
  return NextResponse.json(brands);
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const { name, poster } = await req.json();
  const created = await prisma.brand.create({
    data: { name, poster, categoryId: Number(id) },
  });
  return NextResponse.json(created, { status: 201 });
}
