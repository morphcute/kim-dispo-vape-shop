import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// Handle GET (list by brandId or single flavor)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });
  
  const id = Number(params.id);

  if (isNaN(id)) {
    return new NextResponse("Invalid id", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  if (mode === "list") {
    const flavors = await prisma.flavor.findMany({
      where: { brandId: id },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(flavors);
  }

  const flavor = await prisma.flavor.findUnique({ where: { id } });
  if (!flavor) return new NextResponse("Flavor not found", { status: 404 });

  return NextResponse.json(flavor);
}

