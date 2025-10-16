import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// ---------- DELETE order ----------
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) {
    console.error("❌ Unauthorized delete attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Restore stock for all items before deleting
    for (const item of order.items) {
      await prisma.flavor.update({
        where: { id: item.flavorId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // Delete order (cascade will delete order items)
    await prisma.order.delete({
      where: { id: orderId },
    });

    console.log(`✅ Deleted order #${orderId} and restored stock`);
    return NextResponse.json({ 
      success: true, 
      message: `Order #${orderId} deleted successfully` 
    });

  } catch (e) {
    console.error("❌ DELETE order error:", e);
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ 
      error: errorMessage,
      details: "An unexpected error occurred while deleting the order" 
    }, { status: 500 });
  }
}