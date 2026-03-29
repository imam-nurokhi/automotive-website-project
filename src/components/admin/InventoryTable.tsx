"use client";

import { useState, useMemo } from "react";

type InventoryItem = {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  stockQuantity: number;
  minimumThreshold: number;
  price: string;
  unit: string;
  description: string | null;
};

const CATEGORIES = [
  "ALL",
  "OIL",
  "FILTER",
  "BRAKE",
  "ELECTRICAL",
  "BODY",
  "ENGINE",
  "TRANSMISSION",
  "COOLING",
  "EXHAUST",
  "OTHER",
];

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "Semua",
  OIL: "Oli",
  FILTER: "Filter",
  BRAKE: "Rem",
  ELECTRICAL: "Kelistrikan",
  BODY: "Bodi",
  ENGINE: "Mesin",
  TRANSMISSION: "Transmisi",
  COOLING: "Pendingin",
  EXHAUST: "Knalpot",
  OTHER: "Lainnya",
};

export default function InventoryTable({
  inventory,
}: {
  inventory: InventoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState(inventory);
  const [newItem, setNewItem] = useState({
    itemCode: "",
    name: "",
    category: "OTHER",
    stockQuantity: 0,
    minimumThreshold: 5,
    price: "",
    unit: "pcs",
    description: "",
  });

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        category === "ALL" || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [items, search, category]);

  const lowStockCount = items.filter(
    (i) => i.stockQuantity <= i.minimumThreshold
  ).length;

  const handleEditQty = (id: string, qty: number) => {
    setEditingId(id);
    setEditQty(qty);
  };

  const handleSaveQty = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: editQty }),
    });
    setSaving(false);
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stockQuantity: editQty } : item
        )
      );
      setEditingId(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newItem,
        stockQuantity: Number(newItem.stockQuantity),
        minimumThreshold: Number(newItem.minimumThreshold),
        price: newItem.price,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [
        ...prev,
        { ...created, price: created.price.toString() },
      ]);
      setShowAddForm(false);
      setNewItem({
        itemCode: "",
        name: "",
        category: "OTHER",
        stockQuantity: 0,
        minimumThreshold: 5,
        price: "",
        unit: "pcs",
        description: "",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari nama atau kode item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-medium px-3 py-2 rounded-xl border border-red-100">
                <span className="w-2 h-2 bg-red-500 rounded-full pulse-red" />
                {lowStockCount} item stok rendah
              </span>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Item
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form
            onSubmit={handleAddItem}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <p className="text-sm font-medium text-gray-900 mb-3">
              Tambah Item Baru
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Kode Item *"
                value={newItem.itemCode}
                onChange={(e) =>
                  setNewItem({ ...newItem, itemCode: e.target.value })
                }
                required
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Nama Item *"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                required
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Harga (Rp) *"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                required
                min="0"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Stok Awal"
                value={newItem.stockQuantity}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Min. Threshold"
                value={newItem.minimumThreshold}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    minimumThreshold: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Satuan (pcs, ltr, dll)"
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                >
                  {saving ? "..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Kode
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nama Item
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Kategori
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Stok
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Min. Threshold
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Harga
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-400 py-16 text-sm"
                  >
                    {search || category !== "ALL"
                      ? "Tidak ada item yang sesuai filter."
                      : "Belum ada item inventori."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.stockQuantity <= item.minimumThreshold;
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        isLow ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isLow && (
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 pulse-red" />
                          )}
                          <span className="font-medium text-gray-900">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) =>
                              setEditQty(parseInt(e.target.value) || 0)
                            }
                            className="w-20 border border-red-300 rounded-lg px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`font-semibold ${
                              isLow ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {item.stockQuantity}{" "}
                            <span className="text-gray-400 font-normal text-xs">
                              {item.unit}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {item.minimumThreshold} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSaveQty(item.id)}
                              disabled={saving}
                              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                              {saving ? "..." : "Simpan"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleEditQty(item.id, item.stockQuantity)
                            }
                            className="text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Edit Stok
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {items.length} item
          </div>
        )}
      </div>
    </div>
  );
}
