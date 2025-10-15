import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// ---------- GET all orders ----------
export async function GET(req: Request) {
  if (!isAdmin(req)) {
    console.error("❌ Unauthorized access attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
    const { customer, address, paymentMethod = 'cod', items } = await req.json();

    // Validation
    if (!customer || !customer.trim()) {
      console.error("❌ Missing customer name");
      return new NextResponse("Customer name is required", { status: 400 });
    }

    // Address is optional for backward compatibility, but recommended for new orders
    const orderAddress = address && address.trim() ? address.trim() : "No address provided";

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid or empty items array");
      return new NextResponse("Order must contain at least one item", { status: 400 });
    }

    // Validate payment method
    const validPaymentMethods = ['gcash', 'paymaya', 'grab_pay', 'cod'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      console.error("❌ Invalid payment method:", paymentMethod);
      return new NextResponse("Invalid payment method", { status: 400 });
    }

    // 1) Check stock for all items
    for (const i of items) {
      const flavor = await prisma.flavor.findUnique({ where: { id: i.flavorId } });
      if (!flavor) {
        console.error(`❌ Flavor not found: flavorId=${i.flavorId}`);
        return new NextResponse(`Product not found (ID: ${i.flavorId})`, { status: 400 });
      }
      if (flavor.stock < i.quantity) {
        console.error(`❌ Not enough stock: flavorId=${i.flavorId}, requested=${i.quantity}, available=${flavor.stock}`);
        return new NextResponse(`Not enough stock for ${flavor.name}. Available: ${flavor.stock}`, { status: 400 });
      }
    }

    // 2) Create order with address and payment method
    const order = await prisma.order.create({
      data: {
        customer: customer.trim(),
        address: address.trim(),
        paymentMethod: paymentMethod,
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

    // 3) Decrease stock for each item
    for (const i of items) {
      await prisma.flavor.update({
        where: { id: i.flavorId },
        data: { stock: { decrement: i.quantity } },
      });
    }

    console.log(`✅ Created order #${order.id} for ${customer} | Payment: ${paymentMethod} | Address: ${address.substring(0, 30)}...`);
    return NextResponse.json(order);
    
  } catch (e) {
    console.error("❌ POST order error:", e);
    return new NextResponse("Server error", { status: 500 });
  }
}