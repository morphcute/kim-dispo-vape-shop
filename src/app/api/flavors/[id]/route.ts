import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// Handle GET (list by brandId or single flavor)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return new NextResponse("Invalid id", { status: 400 });
  }

  // If client calls /api/flavors/{brandId}?mode=list → return all flavors for brand
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  if (mode === "list") {
    const flavors = await prisma.flavor.findMany({
      where: { brandId: id },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(flavors);
  }

  // Otherwise return single flavor by its ID
  const flavor = await prisma.flavor.findUnique({ where: { id } });
  if (!flavor) return new NextResponse("Flavor not found", { status: 404 });

  return NextResponse.json(flavor);
}

// Create new flavor for a brand → /api/flavors/{brandId}?mode=list
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const brandId = Number(params.id);
  const body = await req.json();

  const created = await prisma.flavor.create({
    data: {
      brandId,
      name: body.name,
      code: body.code,
      stock: body.stock ?? 0,
    },
  });

  return NextResponse.json(created);
}

// Update a flavor → /api/flavors/{id}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const id = Number(params.id);
  const body = await req.json();

  const updated = await prisma.flavor.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code,
      stock: body.stock,
    },
  });

  return NextResponse.json(updated);
}

// Delete a flavor → /api/flavors/{id}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const id = Number(params.id);

  await prisma.flavor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
