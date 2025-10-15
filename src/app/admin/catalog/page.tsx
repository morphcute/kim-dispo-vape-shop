"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingBag, Box, Plus, Trash2, Pencil } from "lucide-react";
import Modal from "../components/Modal";
import CatalogForm from "../components/CatalogForm";
import { useAdmin } from "../components/AdminProvider";

export default function CatalogPage() {
  const { headers } = useAdmin();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [flavors, setFlavors] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const [modal, setModal] = useState<{
    type: string;
    open: boolean;
    mode: string;
    editData?: any;
  }>({ type: "", open: false, mode: "add" });

  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  // Fetchers
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/categories", { headers });
    setCategories(await res.json());
  }

  async function fetchBrands(catId: number) {
    const res = await fetch(`/api/categories/${catId}/brands`, { headers });
    setBrands(await res.json());
  }

  async function fetchFlavors(brandId: number) {
    const res = await fetch(`/api/brands/${brandId}/flavors`, { headers });
    setFlavors(await res.json());
  }

  // ADD & EDIT
  async function saveCategory(data: Record<string, any>) {
    try {
      if (modal.mode === "edit" && modal.editData) {
        await fetch(`/api/categories/${modal.editData.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
      }
      await fetchCategories();
      setSuccessModal({
        open: true,
        message: `Category has been ${modal.mode === "edit" ? "updated" : "added"} successfully!`
      });
      setModal({ type: "", open: false, mode: "add" });
    } catch (error) {
      setSuccessModal({
        open: true,
        message: "Error saving category. Please try again."
      });
    }
  }

  async function saveBrand(data: Record<string, any>, file?: File | null) {
    if (!selectedCategory) return;
    let brandId = modal.editData?.id;

    try {
      if (modal.mode === "edit") {
        await fetch(`/api/brands/${brandId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ 
            name: data.name,
            categoryId: selectedCategory.id
          }),
        });
      } else {
        const res = await fetch(`/api/categories/${selectedCategory.id}/brands`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name: data.name }),
        });
        const created = await res.json();
        brandId = created.id;
      }

      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        
        // For FormData uploads, don't set Content-Type - let browser handle it
        const uploadHeaders = { ...headers };
        delete (uploadHeaders as any)['Content-Type'];
        
        const upload = await fetch("/api/upload", {
          method: "POST",
          headers: uploadHeaders,
          body: fd,
        });
        if (upload.ok) {
          const { url } = await upload.json();
          await fetch(`/api/brands/${brandId}/poster`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ poster: url }),
          });
        }
      }

      await fetchBrands(selectedCategory.id);
      setSuccessModal({
        open: true,
        message: `Brand has been ${modal.mode === "edit" ? "updated" : "added"} successfully!`
      });
      setModal({ type: "", open: false, mode: "add" });
    } catch (error) {
      setSuccessModal({
        open: true,
        message: "Error saving brand. Please try again."
      });
    }
  }

  async function saveFlavor(data: Record<string, any>) {
    if (!selectedBrand) return;
    const payload = {
      name: data.name,
      code: data.code,
      stock: Number(data.stock),
      costPrice: Number(data.costPrice),
      sellingPrice: Number(data.sellingPrice),
    };

    try {
      if (modal.mode === "edit" && modal.editData) {
        await fetch(`/api/flavors/${modal.editData.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/brands/${selectedBrand.id}/flavors`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      await fetchFlavors(selectedBrand.id);
      setSuccessModal({
        open: true,
        message: `Flavor has been ${modal.mode === "edit" ? "updated" : "added"} successfully!`
      });
      setModal({ type: "", open: false, mode: "add" });
    } catch (error) {
      setSuccessModal({
        open: true,
        message: "Error saving flavor. Please try again."
      });
    }
  }

  // DELETE
  async function deleteCategory(id: number) {
    await fetch(`/api/categories/${id}`, { method: "DELETE", headers });
    await fetchCategories();
    setSelectedCategory(null);
  }

  async function deleteBrand(id: number) {
    await fetch(`/api/brands/${id}`, { method: "DELETE", headers });
    if (selectedCategory) await fetchBrands(selectedCategory.id);
  }

  async function deleteFlavor(id: number) {
    await fetch(`/api/flavors/${id}`, { method: "DELETE", headers });
    if (selectedBrand) await fetchFlavors(selectedBrand.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-6">Catalog</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Categories */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Package className="w-5 h-5 text-yellow-500" />
              Categories
            </h2>
            <button
              onClick={() =>
                setModal({ type: "category", open: true, mode: "add" })
              }
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(c);
                    fetchBrands(c.id);
                    setSelectedBrand(null);
                    setFlavors([]);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-left font-semibold ${
                    selectedCategory?.id === c.id
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      : "bg-gray-900 hover:bg-gray-700"
                  }`}
                >
                  {c.name}
                </button>
                <button
                  onClick={() =>
                    setModal({
                      type: "category",
                      open: true,
                      mode: "edit",
                      editData: c,
                    })
                  }
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag className="w-5 h-5 text-yellow-500" />
              {selectedCategory
                ? `Brands in ${selectedCategory.name}`
                : "Brands"}
            </h2>
            {selectedCategory && (
              <button
                onClick={() =>
                  setModal({ type: "brand", open: true, mode: "add" })
                }
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {brands.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedBrand(b);
                    fetchFlavors(b.id);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-left font-semibold flex items-center gap-3 ${
                    selectedBrand?.id === b.id
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                      : "bg-gray-900 hover:bg-gray-700"
                  }`}
                >
                  {b.poster && (
                    <img
                      src={b.poster}
                      alt={b.name}
                      className="w-8 h-8 object-cover rounded-md border border-gray-700"
                    />
                  )}
                  <span>{b.name}</span>
                </button>
                <button
                  onClick={() =>
                    setModal({
                      type: "brand",
                      open: true,
                      mode: "edit",
                      editData: b,
                    })
                  }
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBrand(b.id)}
                  className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Flavors */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Box className="w-5 h-5 text-yellow-500" />
              {selectedBrand
                ? `Flavors - ${selectedBrand.name}`
                : "Flavors"}
            </h2>
            {selectedBrand && (
              <button
                onClick={() =>
                  setModal({ type: "flavor", open: true, mode: "add" })
                }
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {flavors.map((f) => (
              <div
                key={f.id}
                className="bg-gray-900 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-white">{f.name}</div>
                  <div className="text-xs">
                    <span className="text-green-400">
                      ₱{f.sellingPrice.toFixed(2)}
                    </span>{" "}
                    <span className="text-gray-400">
                      Cost: ₱{f.costPrice.toFixed(2)}
                    </span>{" "}
                    <span
                      className={`${
                        f.sellingPrice - f.costPrice >= 0
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      +₱{(f.sellingPrice - f.costPrice).toFixed(2)}
                    </span>{" "}
                    <span className="text-gray-400">
                      • Stock: {f.stock}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setModal({
                        type: "flavor",
                        open: true,
                        mode: "edit",
                        editData: f,
                      })
                    }
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlavor(f.id)}
                    className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      <Modal
        open={modal.open && modal.type === "category"}
        title={`${modal.mode === "edit" ? "Edit" : "Add"} Category`}
        onClose={() => setModal({ type: "", open: false, mode: "add" })}
      >
        <CatalogForm
          fields={[
            { name: "name", label: "Category Name" },
            { name: "slug", label: "Slug" },
          ]}
          defaultValues={modal.mode === "edit" ? modal.editData : {}}
          onSubmit={saveCategory}
          submitLabel={
            modal.mode === "edit" ? "Update Category" : "Add Category"
          }
        />
      </Modal>

      {/* BRAND MODAL */}
      <Modal
        open={modal.open && modal.type === "brand"}
        title={`${modal.mode === "edit" ? "Edit" : "Add"} Brand`}
        onClose={() => setModal({ type: "", open: false, mode: "add" })}
      >
        <CatalogForm
          fields={[{ name: "name", label: "Brand Name" }]}
          includeFile
          defaultValues={modal.mode === "edit" ? modal.editData : {}}
          onSubmit={saveBrand}
          submitLabel={
            modal.mode === "edit" ? "Update Brand" : "Add Brand"
          }
        />
      </Modal>

      {/* FLAVOR MODAL */}
      <Modal
        open={modal.open && modal.type === "flavor"}
        title={`${modal.mode === "edit" ? "Edit" : "Add"} Flavor`}
        onClose={() => setModal({ type: "", open: false, mode: "add" })}
      >
        <CatalogForm
          fields={[
            { name: "name", label: "Flavor Name" },
            { name: "code", label: "Flavor Code" },
            { name: "stock", label: "Stock", type: "number" },
            { name: "costPrice", label: "Cost Price", type: "number" },
            { name: "sellingPrice", label: "Selling Price", type: "number" },
          ]}
          defaultValues={modal.mode === "edit" ? modal.editData : {}}
          onSubmit={saveFlavor}
          submitLabel={
            modal.mode === "edit" ? "Update Flavor" : "Add Flavor"
          }
        />
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        open={successModal.open}
        title="Success"
        onClose={() => setSuccessModal({ open: false, message: "" })}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-300 text-lg mb-6">{successModal.message}</p>
          <button
            onClick={() => setSuccessModal({ open: false, message: "" })}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}