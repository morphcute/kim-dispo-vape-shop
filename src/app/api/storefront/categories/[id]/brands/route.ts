import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const brands = await prisma.brand.findMany({
      where: { categoryId: Number(id) },
      orderBy: { id: "asc" },
      select: { id: true, name: true, poster: true },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json([], { status: 500 });
  }
}