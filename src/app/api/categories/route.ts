import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  try {
    const cats = await prisma.category.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json(cats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  try {
    const { name, slug } = await req.json();
    const created = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}