"use client";

import { useState, useMemo } from "react";
import { Package, ShoppingBag, TrendingUp, Users, Search, Plus, Edit2, Trash2, Upload, ChevronRight, ChevronDown, BarChart3, DollarSign, Box, ShoppingCart } from "lucide-react";

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
    costPrice: number;  
    sellingPrice: number;
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

  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const headers = useMemo(
    () => ({ "x-admin-token": token, "Content-Type": "application/json" }),
    [token]
  );

  function showAlert(message: string, title: string = "Notice") {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  }

  function handleUnauthorized() {
    setToken("");
    setLoaded(false);
    setCategories([]);
    setBrands([]);
    setFlavors([]);
    setOrders([]);
    setSelectedCat(null);
    setSelectedBrand(null);
    showAlert("Authentication failed. Invalid or expired admin token.", "Authentication Error");
  }

  async function handleLoad() {
    if (!token.trim()) {
      showAlert("Please enter admin token", "Required");
      return;
    }
    
    try {
      const testAuth = await fetch("/api/orders", { headers });
      
      if (testAuth.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!testAuth.ok) {
        showAlert("Failed to connect to server. Please try again.", "Connection Error");
        return;
      }

      await Promise.all([
        fetchCategories(),
        fetchOrders()
      ]);
      
      setLoaded(true);
    } catch (err) {
      console.error("Load error:", err);
      showAlert("Failed to load dashboard. Please check your connection and try again.", "Error");
    }
  }

  async function fetchCategories() {
    const r = await fetch("/api/categories", { headers });
    if (r.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }
    if (!r.ok) throw new Error("Failed to fetch categories");
    const data = await r.json();
    setCategories(data);
  }

  async function fetchBrands(catId: number) {
    const r = await fetch(`/api/categories/${catId}/brands`, { headers });
    if (r.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }
    if (!r.ok) throw new Error("Failed to fetch brands");
    const data = await r.json();
    setBrands(data);
  }

  async function fetchFlavors(brandId: number) {
    const r = await fetch(`/api/brands/${brandId}/flavors`, { headers });
    if (r.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }
    if (!r.ok) throw new Error("Failed to fetch flavors");
    const data = await r.json();
    setFlavors(data);
  }

  async function fetchOrders() {
    setOrdersLoading(true);
    try {
      const r = await fetch("/api/orders", { headers });
      if (r.status === 401) {
        handleUnauthorized();
        setOrders([]);
        return;
      }
      if (!r.ok) {
        setOrders([]);
        return;
      }
      const data = await r.json();
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function addCategory() {
    if (!catName.trim() || !catSlug.trim()) {
      showAlert("Please fill in all fields", "Required");
      return;
    }
    
    try {
      const r = await fetch("/api/categories", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: catName, slug: catSlug }),
      });
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to add category", "Error");
        return;
      }
      
      setCatName("");
      setCatSlug("");
      await fetchCategories();
    } catch (err) {
      console.error("Add category error:", err);
      showAlert("Failed to add category", "Error");
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category? All brands and flavors will be removed.")) return;
    
    try {
      const r = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers,
      });
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to delete category", "Error");
        return;
      }
      
      if (selectedCat?.id === id) {
        setSelectedCat(null);
        setBrands([]);
        setSelectedBrand(null);
        setFlavors([]);
      }
      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      showAlert("Failed to delete category", "Error");
    }
  }

  async function addBrand() {
    if (!selectedCat) {
      showAlert("Please select a category first", "Required");
      return;
    }
    if (!brandName.trim()) {
      showAlert("Please enter brand name", "Required");
      return;
    }

    try {
      const created = await fetch(`/api/categories/${selectedCat.id}/brands`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: brandName }),
      });
      
      if (created.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!created.ok) {
        showAlert("Failed to add brand", "Error");
        return;
      }
      
      const newBrand: Brand = await created.json();

      if (posterFile) {
        const fd = new FormData();
        fd.append("file", posterFile);
        const up = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd,
        });
        
        if (up.status === 401) {
          handleUnauthorized();
          return;
        }
        
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
    } catch (err) {
      console.error("Add brand error:", err);
      showAlert("Failed to add brand", "Error");
    }
  }

  async function deleteBrand(id: number) {
    if (!confirm("Delete this brand? All flavors will be removed.")) return;
    
    try {
      const r = await fetch(`/api/brands/${id}`, { method: "DELETE", headers });
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to delete brand", "Error");
        return;
      }
      
      if (selectedBrand?.id === id) {
        setSelectedBrand(null);
        setFlavors([]);
      }
      if (selectedCat) await fetchBrands(selectedCat.id);
    } catch (err) {
      console.error("Delete brand error:", err);
      showAlert("Failed to delete brand", "Error");
    }
  }

  async function uploadNewPoster(brand: Brand, file: File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd,
      });
      
      if (up.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!up.ok) {
        showAlert("Poster upload failed", "Error");
        return;
      }
      
      const { url } = await up.json();
      const put = await fetch(`/api/brands/${brand.id}/poster`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ poster: url }),
      });
      
      if (put.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!put.ok) {
        showAlert("Failed to set poster", "Error");
        return;
      }
      
      if (selectedCat) await fetchBrands(selectedCat.id);
    } catch (err) {
      console.error("Upload poster error:", err);
      showAlert("Failed to upload poster", "Error");
    }
  }

  async function addFlavor() {
    if (!selectedBrand) {
      showAlert("Please select a brand first", "Required");
      return;
    }
    if (!flName.trim() || !flCode.trim()) {
      showAlert("Please fill in flavor name and code", "Required");
      return;
    }
    
    try {
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
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to add flavor", "Error");
        return;
      }
      
      setFlName("");
      setFlCode("");
      setFlStock(0);
      setFlCostPrice(0);
      setFlSellingPrice(0);
      await fetchFlavors(selectedBrand.id);
    } catch (err) {
      console.error("Add flavor error:", err);
      showAlert("Failed to add flavor", "Error");
    }
  }

  async function deleteFlavor(id: number) {
    if (!confirm("Delete this flavor?")) return;
    
    try {
      const r = await fetch(`/api/flavors/${id}`, { method: "DELETE", headers });
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to delete flavor", "Error");
        return;
      }
      
      if (selectedBrand) await fetchFlavors(selectedBrand.id);
    } catch (err) {
      console.error("Delete flavor error:", err);
      showAlert("Failed to delete flavor", "Error");
    }
  }

  async function saveFlavorEdit(id: number) {
    try {
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
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to update flavor", "Error");
        return;
      }
      
      setEditingId(null);
      if (selectedBrand) await fetchFlavors(selectedBrand.id);
    } catch (err) {
      console.error("Save flavor error:", err);
      showAlert("Failed to update flavor", "Error");
    }
  }

  async function updateOrderStatus(id: number, status: OrderRow["status"]) {
    try {
      const r = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status }),
      });
      
      if (r.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (!r.ok) {
        showAlert("Failed to update order", "Error");
        return;
      }
      
      await fetchOrders();
    } catch (err) {
      console.error("Update order error:", err);
      showAlert("Failed to update order", "Error");
    }
  }

  function handlePickCategory(c: Category) {
    setSelectedCat(c);
    setSelectedBrand(null);
    setFlavors([]);
    fetchBrands(c.id).catch(() => showAlert("Failed to load brands", "Error"));
  }

  function handlePickBrand(b: Brand) {
    setSelectedBrand(b);
    fetchFlavors(b.id).catch(() => showAlert("Failed to load flavors", "Error"));
  }

  function calculateOrderTotal(order: OrderRow): number {
    return order.items.reduce((sum, item) => {
      return sum + (item.flavor.sellingPrice * item.quantity);
    }, 0);
  }

  const totalRevenue = orders
    .filter(o => o.status === "DELIVERED")
    .reduce((sum, o) => sum + calculateOrderTotal(o), 0);

  const totalOrders = orders.length;
  const preparingOrders = orders.filter(o => o.status === "PREPARING").length;
  const totalProducts = flavors.reduce((sum, f) => sum + f.stock, 0);

  const filteredFlavors = flavors.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProfit = orders
    .filter(o => o.status === "DELIVERED")
    .reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => {
        const cost = item.flavor.costPrice || 0;
        const sell = item.flavor.sellingPrice || 0;
        const profit = (sell - cost) * item.quantity;
        return itemSum + profit;
      }, 0);
    }, 0);

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h3 className="text-xl font-bold text-black">{modalTitle}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-base leading-relaxed">{modalMessage}</p>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 rounded-xl transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {!loaded ? (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-yellow-500/30 p-12 max-w-md w-full shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
                <p className="text-gray-400">Enter your token to continue</p>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                  placeholder="Enter admin token"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                />
                <button 
                  onClick={handleLoad} 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                >
                  Access Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-yellow-600/30 shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-white">KIM DISPO</h1>
                      <p className="text-xs text-gray-400">Admin Dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Logout from admin dashboard?")) {
                          handleUnauthorized();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-semibold transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-xl font-black mb-0.5">₱{totalRevenue.toFixed(2)}</div>
                  <div className="text-xs text-blue-200">Total Revenue</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <DollarSign className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-xl font-black mb-0.5">₱{totalProfit.toFixed(2)}</div>
                  <div className="text-xs text-emerald-200">Total Profit</div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <BarChart3 className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-xl font-black mb-0.5">{totalOrders}</div>
                  <div className="text-xs text-purple-200">Total Orders</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <Users className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-xl font-black mb-0.5">{preparingOrders}</div>
                  <div className="text-xs text-yellow-200">Preparing</div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Box className="w-4 h-4" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="text-xl font-black mb-0.5">{totalProducts}</div>
                  <div className="text-xs text-green-200">Total Stock</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-4 bg-gray-800/30 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700">
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { key: "catalog", label: "Catalog", icon: Package },
                    { key: "orders", label: `Orders (${preparingOrders})`, icon: ShoppingCart },
                    { key: "shipped", label: `Shipped (${orders.filter(o => o.status === "SHIPPED").length})`, icon: TrendingUp },
                    { key: "delivered", label: `Delivered (${orders.filter(o => o.status === "DELIVERED").length})`, icon: Box }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-sm ${
                        activeTab === key
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              {activeTab === "catalog" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Categories */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-500" />
                      Categories
                    </h2>
                    
                    <div className="space-y-2 mb-4">
                      <input
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="Category name"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                      />
                      <input
                        value={catSlug}
                        onChange={(e) => setCatSlug(e.target.value)}
                        placeholder="slug-name"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                      />
                      <button 
                        onClick={addCategory}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Category
                      </button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {categories.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <button
                            onClick={() => handlePickCategory(c)}
                            className={`flex-1 text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-sm ${
                              selectedCat?.id === c.id
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold shadow-lg"
                                : "bg-gray-900 hover:bg-gray-800 text-white"
                            }`}
                          >
                            <span>{c.name}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(c.id)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-yellow-500" />
                      {selectedCat ? `Brands in ${selectedCat.name}` : "Select a category"}
                    </h2>

                    {selectedCat && (
                      <>
                        <div className="space-y-2 mb-4">
                          <input
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="Brand name"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                          />
                          <label className="block">
                            <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:border-yellow-500 transition flex items-center gap-2">
                              <Upload className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400 text-xs">
                                {posterFile ? posterFile.name : "Upload poster"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                              className="hidden"
                            />
                          </label>
                          <button 
                            onClick={addBrand}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Brand
                          </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {brands.map((b) => (
                            <div key={b.id} className="bg-gray-900 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-bold text-sm">{b.name}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {b.poster ? "✓ Has poster" : "No poster"}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteBrand(b.id)}
                                  className="text-red-500 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <label className="flex-1">
                                  <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer transition flex items-center gap-1">
                                    <Upload className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">Update</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) uploadNewPoster(b, f);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  onClick={() => handlePickBrand(b)}
                                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 text-xs ${
                                    selectedBrand?.id === b.id
                                      ? "bg-yellow-500 text-black font-bold"
                                      : "bg-gray-800 hover:bg-gray-700 text-white"
                                  }`}
                                >
                                  Flavors
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Flavors */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Box className="w-4 h-4 text-yellow-500" />
                      {selectedBrand ? `Flavors - ${selectedBrand.name}` : "Select a brand"}
                    </h2>

                    {selectedBrand && (
                      <>
                        <div className="space-y-2 mb-4">
                          <input
                            value={flName}
                            onChange={(e) => setFlName(e.target.value)}
                            placeholder="Flavor Name"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                          />
                          <input
                            value={flCode}
                            onChange={(e) => setFlCode(e.target.value)}
                            placeholder="Flavor Code"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              value={flStock === 0 ? "" : flStock}
                              onChange={(e) => setFlStock(Number(e.target.value))}
                              placeholder="Stock"
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={flCostPrice === 0 ? "" : flCostPrice}
                              onChange={(e) => setFlCostPrice(Number(e.target.value))}
                              placeholder="Cost"
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={flSellingPrice === 0 ? "" : flSellingPrice}
                              onChange={(e) => setFlSellingPrice(Number(e.target.value))}
                              placeholder="Sell"
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                            />
                          </div>
                          <button 
                            onClick={addFlavor}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Add Flavor
                          </button>
                        </div>

                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search flavors..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                          />
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredFlavors.map((f) => {
                            const isEditing = editingId === f.id;
                            return (
                              <div key={f.id} className="bg-gray-900 rounded-lg p-2.5">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-xs"
                                      placeholder="Name"
                                    />
                                    <input
                                      value={editCode}
                                      onChange={(e) => setEditCode(e.target.value)}
                                      className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1.5 text-xs"
                                      placeholder="Code"
                                    />
                                    <div className="grid grid-cols-3 gap-1.5">
                                      <input
                                        type="number"
                                        value={editStock}
                                        onChange={(e) => setEditStock(Number(e.target.value))}
                                        placeholder="Stock"
                                        className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1 text-xs"
                                      />
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={editCostPrice}
                                        onChange={(e) => setEditCostPrice(Number(e.target.value))}
                                        placeholder="Cost"
                                        className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1 text-xs"
                                      />
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={editSellingPrice}
                                        onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                                        placeholder="Sell"
                                        className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1 text-xs"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => saveFlavorEdit(f.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-500 py-1.5 rounded-lg text-xs font-semibold"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-1.5 rounded-lg text-xs font-semibold"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="mb-2">
                                      <div className="font-bold text-xs">{f.name}</div>
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        {f.code} • Stock: {f.stock}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <div className="text-xs text-green-400">
                                          ₱{f.sellingPrice.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Cost: ₱{f.costPrice.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-yellow-400">
                                          +₱{(f.sellingPrice - f.costPrice).toFixed(2)}
                                        </div>
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
                                        className="flex-1 bg-gray-800 hover:bg-gray-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteFlavor(f.id)}
                                        className="px-2 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs"
                                      >
                                        <Trash2 className="w-3 h-3" />
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
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {activeTab === "orders" && <><ShoppingCart className="w-5 h-5 text-yellow-500" />Preparing Orders</>}
                      {activeTab === "shipped" && <><TrendingUp className="w-5 h-5 text-blue-500" />Shipped Orders</>}
                      {activeTab === "delivered" && <><Box className="w-5 h-5 text-green-500" />Delivered Orders</>}
                    </h2>
                    <button 
                      onClick={fetchOrders}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg transition font-semibold text-xs"
                    >
                      Refresh
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm">Loading orders...</p>
                    </div>
                  ) : orders.filter(o => 
                    (activeTab === "orders" && o.status === "PREPARING") ||
                    (activeTab === "shipped" && o.status === "SHIPPED") ||
                    (activeTab === "delivered" && o.status === "DELIVERED")
                  ).length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl">
                      <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No orders in this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders
                        .filter(o => 
                          (activeTab === "orders" && o.status === "PREPARING") ||
                          (activeTab === "shipped" && o.status === "SHIPPED") ||
                          (activeTab === "delivered" && o.status === "DELIVERED")
                        )
                        .map((o) => (
                        <div key={o.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition">
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="font-bold text-base">{o.customer}</div>
                                  <div className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                                    #{o.id}
                                  </div>
                                </div>
                                <div className="text-xl font-black text-green-400">
                                  ₱{calculateOrderTotal(o).toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={o.status}
                                  onChange={(e) =>
                                    updateOrderStatus(o.id, e.target.value as OrderRow["status"])
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                    o.status === "PREPARING" ? "bg-yellow-600 hover:bg-yellow-500" :
                                    o.status === "SHIPPED" ? "bg-blue-600 hover:bg-blue-500" :
                                    "bg-green-600 hover:bg-green-500"
                                  }`}
                                >
                                  <option value="PREPARING">PREPARING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                </select>
                                {expanded === o.id ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {expanded === o.id && (
                            <div className="border-t border-gray-800 bg-black/30 p-4">
                              <div className="space-y-3">
                                {(() => {
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
                                      <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                                        <Package className="w-3 h-3" />
                                        {catName}
                                      </div>
                                      {Object.entries(brands).map(([brandName, items]) => {
                                        const brandSubtotal = items.reduce((sum, it) => 
                                          sum + (it.flavor.sellingPrice * it.quantity), 0
                                        );
                                        
                                        return (
                                          <div key={brandName} className="bg-gray-900 rounded-lg p-3 ml-4 border border-gray-800">
                                            <div className="font-bold text-yellow-400 mb-2 flex items-center gap-1.5 text-xs">
                                              <ShoppingBag className="w-3 h-3" />
                                              {brandName}
                                            </div>
                                            <div className="space-y-1.5">
                                              {items.map((it) => (
                                                <div key={it.id} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
                                                  <div className="flex-1">
                                                    <div className="font-medium text-xs">{it.flavor.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                      #{it.flavor.code} • ₱{it.flavor.sellingPrice.toFixed(2)} × {it.quantity}
                                                    </div>
                                                  </div>
                                                  <div className="text-right">
                                                    <div className="font-bold text-sm">×{it.quantity}</div>
                                                    <div className="text-green-400 text-xs font-semibold">
                                                      ₱{(it.flavor.sellingPrice * it.quantity).toFixed(2)}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <div className="text-right pt-2 mt-2 border-t border-gray-800">
                                              <div className="text-xs font-bold text-yellow-400">
                                                Subtotal: ₱{brandSubtotal.toFixed(2)}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ));
                                })()}
                                <div className="text-right pt-3 border-t-2 border-gray-700 mt-3">
                                  <div className="text-xs text-gray-400 mb-0.5">Grand Total</div>
                                  <div className="text-2xl font-black text-green-400">
                                    ₱{calculateOrderTotal(o).toFixed(2)}
                                  </div>
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
            </div>
          </>
        )}
      </div>
    </>
  );
}