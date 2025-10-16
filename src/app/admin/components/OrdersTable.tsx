"use client";

import { useState, useEffect } from "react";
import { Truck, Package, CheckCircle, Undo2, Eye, ChevronDown, ChevronUp, Trash2, Search, X } from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  customer: string;
  address: string;
  paymentMethod: string;
  status: string;
  Total: number;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    flavor: {
      name: string;
      code: string;
      sellingPrice: number;
      brand: {
        name: string;
        category: {
          name: string;
        };
      };
    };
  }>;
}

interface OrdersTableProps {
  title: string;
  status: "PREPARING" | "SHIPPED" | "DELIVERED";
  nextStatus?: "SHIPPED" | "DELIVERED";
  previousStatus?: "PREPARING" | "SHIPPED";
}

export default function OrdersTable({ title, status, nextStatus, previousStatus }: OrdersTableProps) {
  const { headers } = useAdmin();
  const router = useRouter();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [status, headers]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, allOrders, status]);

  async function fetchOrders() {
    try {
      setError(null);
      
      if (!headers || Object.keys(headers).length === 0) {
        console.error("No auth headers available");
        setError("Authentication required");
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/orders", { 
        headers,
        cache: 'no-store'
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error("Unauthorized - redirecting to login");
          setError("Unauthorized access");
          router.push("/admin/login");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }
      
      const fetchedOrders: Order[] = await res.json();
      setAllOrders(fetchedOrders);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
      setOrders([]);
    }
  }

  function filterOrders() {
    if (!searchQuery.trim()) {
      // No search query, show only current status orders
      setIsSearching(false);
      const filteredOrders = allOrders.filter(order => order.status === status);
      setOrders(filteredOrders);
      return;
    }

    // Search across ALL orders regardless of status
    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    
    const searchResults = allOrders.filter(order => {
      // Search by order ID
      if (order.id.toString().includes(query)) return true;
      
      // Search by customer name
      if (order.customer.toLowerCase().includes(query)) return true;
      
      // Search by address
      if (order.address.toLowerCase().includes(query)) return true;
      
      // Search by payment method
      if (order.paymentMethod.toLowerCase().includes(query)) return true;
      
      // Search by status
      if (order.status.toLowerCase().includes(query)) return true;
      
      // Search by product name or code
      const hasMatchingItem = order.items.some(item => 
        item.flavor.name.toLowerCase().includes(query) ||
        item.flavor.code.toLowerCase().includes(query) ||
        item.flavor.brand.name.toLowerCase().includes(query)
      );
      
      return hasMatchingItem;
    });

    setOrders(searchResults);
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to update order status");
      }
      
      fetchOrders();
      setExpandedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  }

  async function deleteOrder(orderId: number) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to delete order");
      }
      
      fetchOrders();
      setDeleteConfirm(null);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setIsSearching(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusIcon(orderStatus: string) {
    switch (orderStatus) {
      case 'PREPARING':
        return <Package className="w-4 h-4" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  }

  function getStatusColor(orderStatus: string) {
    switch (orderStatus) {
      case 'PREPARING':
        return "bg-yellow-500 text-yellow-900";
      case 'SHIPPED':
        return "bg-blue-500 text-blue-900";
      case 'DELIVERED':
        return "bg-green-500 text-green-900";
      default:
        return "bg-gray-500 text-gray-900";
    }
  }

  function getNextStatusButton(nextStatus: string) {
    switch (nextStatus) {
      case 'SHIPPED':
        return { icon: <Truck className="w-4 h-4" />, text: "Ship", color: "bg-blue-600 hover:bg-blue-500" };
      case 'DELIVERED':
        return { icon: <CheckCircle className="w-4 h-4" />, text: "Deliver", color: "bg-green-600 hover:bg-green-500" };
      default:
        return { icon: <Package className="w-4 h-4" />, text: "Update", color: "bg-gray-600 hover:bg-gray-500" };
    }
  }

  function getPreviousStatusButton(previousStatus: string) {
    switch (previousStatus) {
      case 'PREPARING':
        return { icon: <Package className="w-4 h-4" />, text: "To Prep", color: "bg-yellow-600 hover:bg-yellow-500" };
      case 'SHIPPED':
        return { icon: <Truck className="w-4 h-4" />, text: "To Ship", color: "bg-blue-600 hover:bg-blue-500" };
      default:
        return { icon: <Undo2 className="w-4 h-4" />, text: "Undo", color: "bg-gray-600 hover:bg-gray-500" };
    }
  }

  // Mobile Card View
  const MobileOrderCard = ({ order }: { order: Order }) => {
    const nextButton = nextStatus ? getNextStatusButton(nextStatus) : null;
    const prevButton = previousStatus ? getPreviousStatusButton(previousStatus) : null;
    const isExpanded = expandedOrder === order.id;

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">#{order.id}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="hidden sm:inline">{order.status}</span>
              </span>
            </div>
            <div className="text-sm text-white font-medium">{order.customer}</div>
          </div>
          <button
            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <div className="text-gray-400">Total</div>
            <div className="text-green-400 font-semibold">₱{order.Total.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400">Payment</div>
            <div className="text-white capitalize">{order.paymentMethod}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSelectedOrder(order)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm flex items-center gap-1 flex-1 justify-center"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => setDeleteConfirm(order.id)}
            className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="border-t border-gray-700 pt-3 space-y-3">
            <div>
              <div className="text-gray-400 text-sm mb-1">Address</div>
              <div className="text-white text-sm">{order.address}</div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm mb-1">Date</div>
              <div className="text-white text-sm">{formatDate(order.createdAt)}</div>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2 pt-2">
              {prevButton && (
                <button
                  onClick={() => updateOrderStatus(order.id, previousStatus!)}
                  className={`${prevButton.color} text-white px-3 py-2 rounded text-sm flex items-center gap-1 flex-1 justify-center`}
                >
                  <Undo2 className="w-4 h-4" />
                  {prevButton.text}
                </button>
              )}
              
              {nextButton && (
                <button
                  onClick={() => updateOrderStatus(order.id, nextStatus!)}
                  className={`${nextButton.color} text-white px-3 py-2 rounded text-sm flex items-center gap-1 flex-1 justify-center`}
                >
                  {nextButton.icon}
                  {nextButton.text}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-xl font-bold text-yellow-400">{title}</h1>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all orders (ID, customer, product, status...)"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-10 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {isSearching && (
        <div className="bg-blue-900/30 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span>
              Found <strong>{orders.length}</strong> order{orders.length !== 1 ? 's' : ''} matching "{searchQuery}" across all statuses
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="text-blue-200 hover:text-white underline text-sm"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Mobile View */}
      <div className="block lg:hidden">
        {orders.map((order) => (
          <MobileOrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {orders.map((order) => {
              const nextButton = nextStatus ? getNextStatusButton(nextStatus) : null;
              const prevButton = previousStatus ? getPreviousStatusButton(previousStatus) : null;
              
              return (
                <tr key={order.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                    {order.address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-400 font-semibold">
                    ₱{order.Total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="flex gap-1">
                        {prevButton && (
                          <button
                            onClick={() => updateOrderStatus(order.id, previousStatus!)}
                            className={`${prevButton.color} text-white px-2 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center`}
                          >
                            <Undo2 className="w-3 h-3" />
                          </button>
                        )}
                        
                        {nextButton && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus!)}
                            className={`${nextButton.color} text-white px-2 py-1 rounded text-xs flex items-center gap-1 flex-1 justify-center`}
                          >
                            {nextButton.icon}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && !error && !isSearching && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">No {title.toLowerCase()}</h3>
            <p className="text-gray-500">There are no orders in this status.</p>
          </div>
        )}

        {orders.length === 0 && isSearching && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">No results found</h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600/20 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Order?</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete order #{deleteConfirm}? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrder(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Items Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-yellow-400">
                Order #{selectedOrder.id} - {selectedOrder.customer}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-400">Address:</span>
                  <p className="text-white mt-1">{selectedOrder.address}</p>
                </div>
                <div>
                  <span className="text-gray-400">Payment Method:</span>
                  <p className="text-white mt-1 capitalize">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-white mb-4">Order Items:</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{item.flavor.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Code: {item.flavor.code} • Brand: {item.flavor.brand.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Category: {item.flavor.brand.category.name}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="text-green-400 font-semibold text-sm">
                          ₱{item.flavor.sellingPrice.toFixed(2)} × {item.quantity}
                        </div>
                        <div className="text-white font-bold">
                          ₱{(item.flavor.sellingPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 mt-6 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-green-400 font-bold text-xl">
                    ₱{selectedOrder.Total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}