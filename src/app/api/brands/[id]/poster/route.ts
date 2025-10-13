import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const { poster } = await req.json();
  const updated = await prisma.brand.update({
    where: { id: Number(id) },
    data: { poster },
  });
  return NextResponse.json(updated);
}
