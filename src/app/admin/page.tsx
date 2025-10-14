"use client";

import { useState, useMemo } from "react";

type Category = { id: number; name: string; slug: string };
type Brand = { id: number; name: string; poster: string | null };
type Flavor = { 
  id: number; 
  name: string; 
  code: string; 
  stock: number;
  costPrice: number;
  sellingPrice: number;
};
type OrderItemRow = { 
  id: number; 
  quantity: number; 
  flavor: { 
    name: string; 
    code: string;
    sellingPrice: number; // ✅ ADDED THIS
    brand?: { 
      name: string;
      category?: { name: string };
    };
  } 
};
type OrderRow = { 
  id: number; 
  customer: string; 
  status: "PREPARING"|"SHIPPED"|"DELIVERED"; 
  items: OrderItemRow[] 
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalog"|"orders"|"shipped"|"delivered">("catalog");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [flavors, setFlavors] = useState<Flavor[]>([]);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [brandName, setBrandName] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [flName, setFlName] = useState("");
  const [flCode, setFlCode] = useState("");
  const [flStock, setFlStock] = useState<number>(0);
  const [flCostPrice, setFlCostPrice] = useState<number>(0);
  const [flSellingPrice, setFlSellingPrice] = useState<number>(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editStock, setEditStock] = useState<number>(0);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);

  const headers = useMemo(
    () => ({ "x-admin-token": token, "Content-Type": "application/json" }),
    [token]
  );

  async function handleLoad() {
    if (!token) return alert("Enter admin token");
    try {
      await fetchCategories();
      await fetchOrders();
      setLoaded(true);
    } catch {
      alert("Failed to load. Check your token.");
    }
  }

  async function fetchCategories() {
    const r = await fetch("/api/categories", { headers });
    if (!r.ok) throw new Error("categories");
    setCategories(await r.json());
  }

  async function fetchBrands(catId: number) {
    const r = await fetch(`/api/categories/${catId}/brands`, { headers });
    if (!r.ok) throw new Error("brands");
    setBrands(await r.json());
  }

  async function fetchFlavors(brandId: number) {
    const r = await fetch(`/api/brands/${brandId}/flavors`, { headers });
    if (!r.ok) throw new Error("flavors");
    setFlavors(await r.json());
  }

  // Replace the fetchOrders function with this version that includes error logging:

async function fetchOrders() {
  setOrdersLoading(true);
  try {
    const r = await fetch("/api/orders", { headers });
    console.log("Orders response status:", r.status);
    
    if (!r.ok) {
      console.error("Failed to fetch orders:", r.status, r.statusText);
      const errorText = await r.text();
      console.error("Error response:", errorText);
      setOrders([]);
      return;
    }
    
    const data = await r.json();
    console.log("Orders fetched successfully:", data);
    console.log("Number of orders:", data.length);
    
    setOrders(data);
  } catch (err) {
    console.error("Exception while fetching orders:", err);
    setOrders([]);
  } finally {
    setOrdersLoading(false);
  }
}

  async function addCategory() {
    if (!catName || !catSlug) return;
    const r = await fetch("/api/categories", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: catName, slug: catSlug }),
    });
    if (!r.ok) return alert("Failed to add category");
    setCatName("");
    setCatSlug("");
    await fetchCategories();
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    const r = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!r.ok) return alert("Failed to delete category");
    if (selectedCat?.id === id) {
      setSelectedCat(null);
      setBrands([]);
      setSelectedBrand(null);
      setFlavors([]);
    }
    await fetchCategories();
  }

  async function addBrand() {
    if (!selectedCat) return alert("Pick a category first");
    if (!brandName) return;

    const created = await fetch(`/api/categories/${selectedCat.id}/brands`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: brandName }),
    });
    if (!created.ok) return alert("Failed to add brand");
    const newBrand: Brand = await created.json();

    if (posterFile) {
      const fd = new FormData();
      fd.append("file", posterFile);
      const up = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd,
      });
      if (up.ok) {
        const { url } = await up.json();
        await fetch(`/api/brands/${newBrand.id}/poster`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ poster: url }),
        });
      }
    }

    setBrandName("");
    setPosterFile(null);
    await fetchBrands(selectedCat.id);
  }

  async function deleteBrand(id: number) {
    if (!confirm("Delete this brand?")) return;
    const r = await fetch(`/api/brands/${id}`, { method: "DELETE", headers });
    if (!r.ok) return alert("Failed to delete brand");
    if (selectedBrand?.id === id) {
      setSelectedBrand(null);
      setFlavors([]);
    }
    if (selectedCat) await fetchBrands(selectedCat.id);
  }

  async function uploadNewPoster(brand: Brand, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: fd,
    });
    if (!up.ok) return alert("Poster upload failed");
    const { url } = await up.json();
    const put = await fetch(`/api/brands/${brand.id}/poster`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ poster: url }),
    });
    if (!put.ok) return alert("Failed to set poster");
    if (selectedCat) await fetchBrands(selectedCat.id);
  }

  async function addFlavor() {
    if (!selectedBrand) return alert("Pick a brand first");
    if (!flName || !flCode) return;
    const r = await fetch(`/api/brands/${selectedBrand.id}/flavors`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        name: flName, 
        code: flCode, 
        stock: flStock,
        costPrice: flCostPrice,
        sellingPrice: flSellingPrice
      }),
    });
    if (!r.ok) return alert("Failed to add flavor");
    setFlName("");
    setFlCode("");
    setFlStock(0);
    setFlCostPrice(0);
    setFlSellingPrice(0);
    await fetchFlavors(selectedBrand.id);
  }

  async function deleteFlavor(id: number) {
    if (!confirm("Delete flavor?")) return;
    const r = await fetch(`/api/flavors/${id}`, { method: "DELETE", headers });
    if (!r.ok) return alert("Failed to delete flavor");
    if (selectedBrand) await fetchFlavors(selectedBrand.id);
  }

  async function saveFlavorEdit(id: number) {
    const r = await fetch(`/api/flavors/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ 
        name: editName, 
        code: editCode, 
        stock: editStock,
        costPrice: editCostPrice,
        sellingPrice: editSellingPrice
      }),
    });
    if (!r.ok) return alert("Failed to update flavor");
    setEditingId(null);
    if (selectedBrand) await fetchFlavors(selectedBrand.id);
  }

  async function updateOrderStatus(id: number, status: OrderRow["status"]) {
    const r = await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });
    if (!r.ok) return alert("Failed to update order");
    await fetchOrders();
  }

  function handlePickCategory(c: Category) {
    setSelectedCat(c);
    setSelectedBrand(null);
    setFlavors([]);
    fetchBrands(c.id).catch(() => alert("Failed to load brands"));
  }

  function handlePickBrand(b: Brand) {
    setSelectedBrand(b);
    fetchFlavors(b.id).catch(() => alert("Failed to load flavors"));
  }

  // ✅ Helper function to calculate order total
  function calculateOrderTotal(order: OrderRow): number {
    return order.items.reduce((sum, item) => {
      return sum + (item.flavor.sellingPrice * item.quantity);
    }, 0);
  }

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="bg-neutral-900 border-b border-yellow-600 px-6 py-4">
        <h1 className="text-2xl font-bold">KIM DISPO VAPE SHOP</h1>
        <p className="text-sm text-neutral-400">Admin Dashboard</p>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {!loaded && (
          <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Authentication</h2>
            <div className="flex gap-3">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter admin token"
                className="flex-1 bg-black border border-yellow-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button 
                onClick={handleLoad} 
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded transition"
              >
                Load Dashboard
              </button>
            </div>
          </div>
        )}

        {loaded && (
          <>
            <div className="mb-6 border-b border-neutral-800">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === "catalog"
                      ? "border-b-2 border-yellow-500 text-yellow-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Product Catalog
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === "orders"
                      ? "border-b-2 border-yellow-500 text-yellow-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Orders ({orders.filter(o => o.status === "PREPARING").length})
                </button>
                <button
                  onClick={() => setActiveTab("shipped")}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === "shipped"
                      ? "border-b-2 border-yellow-500 text-yellow-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Shipped ({orders.filter(o => o.status === "SHIPPED").length})
                </button>
                <button
                  onClick={() => setActiveTab("delivered")}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === "delivered"
                      ? "border-b-2 border-yellow-500 text-yellow-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Delivered ({orders.filter(o => o.status === "DELIVERED").length})
                </button>
              </div>
            </div>

            {activeTab === "catalog" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Categories</h2>
                  
                  <div className="space-y-3 mb-6">
                    <input
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Category name"
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                    />
                    <input
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="slug-name"
                      className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                    />
                    <button 
                      onClick={addCategory}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded transition"
                    >
                      Add Category
                    </button>
                  </div>

                  <div className="space-y-2">
                    {categories.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <button
                          onClick={() => handlePickCategory(c)}
                          className={`flex-1 text-left px-3 py-2 rounded transition ${
                            selectedCat?.id === c.id
                              ? "bg-yellow-500 text-black font-semibold"
                              : "bg-neutral-800 hover:bg-neutral-700"
                          }`}
                        >
                          {c.name}
                        </button>
                        <button
                          onClick={() => deleteCategory(c.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedCat ? `Brands in ${selectedCat.name}` : "Select a category"}
                  </h2>

                  {selectedCat && (
                    <>
                      <div className="space-y-3 mb-6">
                        <input
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="Brand name"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                          className="w-full text-sm"
                        />
                        <button 
                          onClick={addBrand}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded transition"
                        >
                          Add Brand
                        </button>
                      </div>

                      <div className="space-y-2">
                        {brands.map((b) => (
                          <div key={b.id} className="bg-neutral-800 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium">{b.name}</div>
                                <div className="text-xs text-neutral-500">
                                  {b.poster ? "✓ Has poster" : "No poster"}
                                </div>
                              </div>
                              <button
                                onClick={() => deleteBrand(b.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadNewPoster(b, f);
                                }}
                                className="flex-1 text-xs"
                              />
                              <button
                                onClick={() => handlePickBrand(b)}
                                className={`px-3 py-1 rounded text-xs transition ${
                                  selectedBrand?.id === b.id
                                    ? "bg-yellow-500 text-black"
                                    : "bg-neutral-700 hover:bg-neutral-600"
                                }`}
                              >
                                Flavors
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Flavors */}
                <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedBrand ? `Flavors - ${selectedBrand.name}` : "Select a brand"}
                  </h2>

                  {selectedBrand && (
                    <>
                      <div className="space-y-3 mb-6">
                        <input
                          value={flName}
                          onChange={(e) => setFlName(e.target.value)}
                          placeholder="Flavor Name"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          value={flCode}
                          onChange={(e) => setFlCode(e.target.value)}
                          placeholder="Flavor Code"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          value={flStock === 0 ? "" : flStock}
                          onChange={(e) => setFlStock(Number(e.target.value))}
                          placeholder="Quantity"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={flCostPrice === 0 ? "" : flCostPrice}
                          onChange={(e) => setFlCostPrice(Number(e.target.value))}
                          placeholder="Cost Price (₱)"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={flSellingPrice === 0 ? "" : flSellingPrice}
                          onChange={(e) => setFlSellingPrice(Number(e.target.value))}
                          placeholder="Sell Price (₱)"
                          className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <button 
                          onClick={addFlavor}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded transition"
                        >
                          Add Flavor
                        </button>
                      </div>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {flavors.map((f) => {
                          const isEditing = editingId === f.id;
                          return (
                            <div key={f.id} className="bg-neutral-800 rounded p-3">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
                                    placeholder="Name"
                                  />
                                  <input
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
                                    placeholder="Code"
                                  />
                                  <input
                                    type="number"
                                    value={editStock}
                                    onChange={(e) => setEditStock(Number(e.target.value))}
                                    placeholder="Stock"
                                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editCostPrice}
                                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                                    placeholder="Cost Price (₱)"
                                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editSellingPrice}
                                    onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                                    placeholder="Selling Price (₱)"
                                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveFlavorEdit(f.id)}
                                      className="flex-1 bg-green-600 hover:bg-green-500 py-1 rounded text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="flex-1 bg-neutral-600 hover:bg-neutral-500 py-1 rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="mb-2">
                                    <div className="font-medium text-sm">{f.name}</div>
                                    <div className="text-xs text-neutral-400">
                                      {f.code} • Stock: {f.stock}
                                    </div>
                                    <div className="text-xs text-green-400 mt-1">
                                      Cost: ₱{f.costPrice.toFixed(2)} • Sell: ₱{f.sellingPrice.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-yellow-400">
                                      Profit: ₱{(f.sellingPrice - f.costPrice).toFixed(2)} per unit
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingId(f.id);
                                        setEditName(f.name);
                                        setEditCode(f.code);
                                        setEditStock(f.stock);
                                        setEditCostPrice(f.costPrice);
                                        setEditSellingPrice(f.sellingPrice);
                                      }}
                                      className="flex-1 bg-neutral-700 hover:bg-neutral-600 py-1 rounded text-xs"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteFlavor(f.id)}
                                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {(activeTab === "orders" || activeTab === "shipped" || activeTab === "delivered") && (
              <div className="bg-neutral-900 border border-yellow-600 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">
                    {activeTab === "orders" && "Preparing Orders"}
                    {activeTab === "shipped" && "Shipped Orders"}
                    {activeTab === "delivered" && "Delivered Orders"}
                  </h2>
                  <button 
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded transition"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12 text-neutral-400">Loading orders...</div>
                ) : orders.filter(o => 
                  (activeTab === "orders" && o.status === "PREPARING") ||
                  (activeTab === "shipped" && o.status === "SHIPPED") ||
                  (activeTab === "delivered" && o.status === "DELIVERED")
                ).length === 0 ? (
                  <div className="text-center py-12 text-neutral-400">No orders in this category</div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(o => 
                        (activeTab === "orders" && o.status === "PREPARING") ||
                        (activeTab === "shipped" && o.status === "SHIPPED") ||
                        (activeTab === "delivered" && o.status === "DELIVERED")
                      )
                      .map((o) => (
                      <div key={o.id} className="bg-neutral-800 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                          >
                            <div className="font-semibold">{o.customer}</div>
                            <div className="text-sm text-neutral-400">Order #{o.id}</div>
                            {/* ✅ SHOW TOTAL PRICE HERE */}
                            <div className="text-lg font-bold text-green-400 mt-1">
                              ₱{calculateOrderTotal(o).toFixed(2)}
                            </div>
                          </div>
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(o.id, e.target.value as OrderRow["status"])
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 rounded text-sm font-semibold ${
                              o.status === "PREPARING" ? "bg-yellow-600" :
                              o.status === "SHIPPED" ? "bg-blue-600" :
                              "bg-green-600"
                            }`}
                          >
                            <option value="PREPARING">PREPARING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </div>

                        {expanded === o.id && (
                          <div className="border-t border-neutral-700 pt-3 space-y-3">
                            {(() => {
                              // Group items by category and brand
                              const grouped: Record<string, Record<string, OrderItemRow[]>> = {};
                              
                              o.items.forEach((it) => {
                                const cat = it.flavor.brand?.category?.name || "Uncategorized";
                                const brand = it.flavor.brand?.name || "Unknown Brand";
                                
                                if (!grouped[cat]) grouped[cat] = {};
                                if (!grouped[cat][brand]) grouped[cat][brand] = [];
                                grouped[cat][brand].push(it);
                              });

                              return Object.entries(grouped).map(([catName, brands]) => (
                                <div key={catName} className="space-y-2">
                                  <div className="text-xs text-blue-400 font-semibold">
                                    📁 {catName}
                                  </div>
                                  {Object.entries(brands).map(([brandName, items]) => {
                                    const brandSubtotal = items.reduce((sum, it) => 
                                      sum + (it.flavor.sellingPrice * it.quantity), 0
                                    );
                                    
                                    return (
                                      <div key={brandName} className="bg-neutral-900 rounded p-3 ml-4">
                                        <div className="font-semibold text-yellow-500 mb-2">
                                          {brandName}
                                        </div>
                                        <div className="space-y-1">
                                          {items.map((it) => (
                                            <div key={it.id} className="flex justify-between items-center text-sm">
                                              <div className="flex-1">
                                                <span>{it.flavor.name}</span>
                                                <span className="text-neutral-400 text-xs"> (#{it.flavor.code})</span>
                                                <div className="text-xs text-neutral-500">
                                                  ₱{it.flavor.sellingPrice.toFixed(2)} × {it.quantity}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="font-semibold">×{it.quantity}</div>
                                                <div className="text-green-400 text-xs">
                                                  ₱{(it.flavor.sellingPrice * it.quantity).toFixed(2)}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {/* Brand Subtotal */}
                                        <div className="text-right pt-2 mt-2 border-t border-neutral-700">
                                          <div className="text-sm font-semibold text-yellow-400">
                                            Subtotal: ₱{brandSubtotal.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ));
                            })()}
                            {/* ✅ GRAND TOTAL AT THE BOTTOM */}
                            <div className="text-right pt-2 border-t border-neutral-600 mt-2">
                              <div className="text-lg font-bold text-green-400">
                                Grand Total: ₱{calculateOrderTotal(o).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}