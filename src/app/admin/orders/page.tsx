import OrdersTable from "../components/OrdersTable";

export default function OrdersPage() {
  return <OrdersTable title="Preparing Orders" status="PREPARING" nextStatus="SHIPPED" />;
}