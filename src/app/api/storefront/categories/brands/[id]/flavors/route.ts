import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const flavors = await prisma.flavor.findMany({
    where: { brandId: Number(id) },
    orderBy: { id: "asc" },
    select: { id: true, name: true, code: true, stock: true },
  });
  return NextResponse.json(flavors);
}
