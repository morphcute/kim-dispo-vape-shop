import OrdersTable from "../components/OrdersTable";

export default function ShippedPage() {
  return <OrdersTable title="Shipped Orders" status="SHIPPED" nextStatus="DELIVERED" previousStatus="PREPARING" />;
}