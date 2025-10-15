import OrdersTable from "../components/OrdersTable";

export default function DeliveredPage() {
  return <OrdersTable title="Delivered Orders" status="DELIVERED" previousStatus="SHIPPED" />;
}