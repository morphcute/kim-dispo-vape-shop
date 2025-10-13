import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ---------- GET all orders ----------
export async function GET(req: Request) {
  // ✅ FIX: Check if admin token exists in headers
  const token = req.headers.get("x-admin-token");
  
  if (!token) {
    console.error("❌ No admin token provided");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // ✅ FIX: Add more detailed error logging
  try {
    const orders = await prisma.order.findMany({
      orderBy: { id: "desc" },
      include: {
        items: {
          include: {
            flavor: {
              select: {
                name: true,
                code: true,
                sellingPrice: true,
                brand: {
                  select: {
                    name: true,
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            },
          },
        },
      },
    });
    
    console.log(`✅ Successfully fetched ${orders.length} orders`);
    return NextResponse.json(orders);
    
  } catch (e) {
    console.error("❌ GET orders error:", e);
    return new NextResponse("Server error", { status: 500 });
  }
}

// ---------- POST create new order ----------
export async function POST(req: Request) {
  try {
    const { customer, items } = await req.json();

    if (!customer || !items || items.length === 0) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    // 1) Check stock
    for (const i of items) {
      const flavor = await prisma.flavor.findUnique({ where: { id: i.flavorId } });
      if (!flavor || flavor.stock < i.quantity) {
        return new NextResponse(`Not enough stock for flavorId=${i.flavorId}`, { status: 400 });
      }
    }

    // 2) Create order
    const order = await prisma.order.create({
      data: {
        customer,
        status: "PREPARING",
        items: {
          create: items.map((i: any) => ({
            flavorId: i.flavorId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            flavor: { 
              select: {
                name: true,
                code: true,
                sellingPrice: true,
                brand: {
                  select: {
                    name: true,
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            },
          },
        },
      },
    });

    // 3) Decrease stock
    for (const i of items) {
      await prisma.flavor.update({
        where: { id: i.flavorId },
        data: { stock: { decrement: i.quantity } },
      });
    }

    console.log(`✅ Created order #${order.id} for ${customer}`);
    return NextResponse.json(order);
    
  } catch (e) {
    console.error("❌ POST order error:", e);
    return new NextResponse("Server error", { status: 500 });
  }
}