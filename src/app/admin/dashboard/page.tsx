"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, ShoppingCart, Box } from "lucide-react";
import StatsCard from "./../components/StatsCard";
import { useAdmin } from "./../components/AdminProvider";

export default function DashboardPage() {
  const { headers } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [headers]);

  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const totalRevenue = delivered.reduce((sum, o) => sum + (o.Total || 0), 0);
  
  const totalProfit = delivered.reduce((sum, order) => {
    const orderProfit = order.items.reduce((orderSum: number, item: any) => {
      const sellingPrice = item.flavor.sellingPrice || 0;
      const costPrice = item.flavor.costPrice || 0;
      const quantity = item.quantity || 0;
      return orderSum + (sellingPrice - costPrice) * quantity;
    }, 0);
    return sum + orderProfit;
  }, 0);

  const totalOrders = orders.length;
  const preparing = orders.filter((o) => o.status === "PREPARING").length;

  if (loading) return <p className="text-gray-400">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-yellow-400">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          label="Revenue"
          value={`₱${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          label="Profit"
          value={`₱${totalProfit.toFixed(2)}`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          label="Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="purple"
        />
        <StatsCard
          label="Preparing"
          value={preparing}
          icon={Box}
          color="green"
        />
      </div>
    </div>
  );
}