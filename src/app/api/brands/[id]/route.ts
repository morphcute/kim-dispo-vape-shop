import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin, unauthorizedResponse } from "@/lib/adminAuth";

// GET - Public access for storefront
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        flavors: {
          select: {
            id: true,
            name: true,
            code: true,
            stock: true,
            costPrice: true,
            sellingPrice: true
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

// PUT - Update brand (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    if (!isAdmin(req)) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { name, poster, categoryId } = body;

    // Validate required fields
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and categoryId are required" },
        { status: 400 }
      );
    }

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: Number(id) }
    });

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Update brand
    const updatedBrand = await prisma.brand.update({
      where: { id: Number(id) },
      data: {
        name,
        poster: poster || existingBrand.poster,
        categoryId: Number(categoryId)
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        flavors: {
          select: {
            id: true,
            name: true,
            code: true,
            stock: true,
            costPrice: true,
            sellingPrice: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      brand: updatedBrand
    });

  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE - Admin only
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Check if brand exists first
    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) }
    });
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    
    await prisma.brand.delete({ where: { id: Number(id) } });
    
    return NextResponse.json({ 
      success: true,
      message: 'Brand deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}