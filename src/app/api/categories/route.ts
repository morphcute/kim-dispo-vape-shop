import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
  const cats = await prisma.category.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  const { name, slug } = await req.json();
  const created = await prisma.category.create({ data: { name, slug } });
  return NextResponse.json(created, { status: 201 });
}
