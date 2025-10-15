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
                costPrice: true,
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
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    if (customer.trim().length < 3) {
      console.error("❌ Customer name too short");
      return NextResponse.json({ error: "Customer name must be at least 3 characters" }, { status: 400 });
    }

    // Address validation
    if (!address || !address.trim()) {
      console.error("❌ Missing address");
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    if (address.trim().length < 10) {
      console.error("❌ Address too short");
      return NextResponse.json({ error: "Please enter a complete address (at least 10 characters)" }, { status: 400 });
    }

    const orderAddress = address.trim();

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("❌ Invalid or empty items array");
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    // Validate payment method - FIXED: Accept all payment methods including 'gcash' for QR Ph
    const validPaymentMethods = ['gcash', 'paymaya', 'grab_pay', 'cod'];
    const normalizedPaymentMethod = paymentMethod.toLowerCase();
    
    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      console.error("❌ Invalid payment method:", paymentMethod);
      return NextResponse.json({ 
        error: `Invalid payment method: ${paymentMethod}. Accepted methods: ${validPaymentMethods.join(', ')}` 
      }, { status: 400 });
    }

    // 1) Check stock for all items and calculate total
    let orderTotal = 0;
    const flavorDetails = [];

    for (const i of items) {
      if (!i.flavorId || !i.quantity || i.quantity <= 0) {
        console.error("❌ Invalid item data:", i);
        return NextResponse.json({ 
          error: "Each item must have a valid flavorId and quantity" 
        }, { status: 400 });
      }

      const flavor = await prisma.flavor.findUnique({ 
        where: { id: i.flavorId },
        include: {
          brand: {
            select: { name: true }
          }
        }
      });

      if (!flavor) {
        console.error(`❌ Flavor not found: flavorId=${i.flavorId}`);
        return NextResponse.json({ 
          error: `Product not found (ID: ${i.flavorId})` 
        }, { status: 400 });
      }

      if (flavor.stock < i.quantity) {
        console.error(`❌ Not enough stock: flavorId=${i.flavorId}, requested=${i.quantity}, available=${flavor.stock}`);
        return NextResponse.json({ 
          error: `Not enough stock for ${flavor.name}. Available: ${flavor.stock}` 
        }, { status: 400 });
      }

      // Calculate total for this item
      const itemTotal = (flavor.sellingPrice || 0) * i.quantity;
      orderTotal += itemTotal;
      
      flavorDetails.push({
        name: flavor.name,
        brand: flavor.brand.name,
        quantity: i.quantity,
        price: flavor.sellingPrice,
        subtotal: itemTotal
      });
    }

    // 2) Create order with address, payment method, and total
    const order = await prisma.order.create({
      data: {
        customer: customer.trim(),
        address: orderAddress,
        paymentMethod: normalizedPaymentMethod,
        status: "PREPARING",
        Total: orderTotal,
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
                costPrice: true,
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

    console.log(`✅ Created order #${order.id}`);
    console.log(`   Customer: ${customer}`);
    console.log(`   Total: ₱${orderTotal.toFixed(2)}`);
    console.log(`   Payment: ${normalizedPaymentMethod.toUpperCase()}`);
    console.log(`   Address: ${orderAddress.substring(0, 50)}...`);
    console.log(`   Items: ${flavorDetails.length} products`);
    
    return NextResponse.json(order);
    
  } catch (e) {
    console.error("❌ POST order error:", e);
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ 
      error: errorMessage,
      details: "An unexpected error occurred while creating the order" 
    }, { status: 500 });
  }
}