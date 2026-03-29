"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Vehicle = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  user: { name: string | null; email: string | null };
};

type InventoryItem = {
  id: string;
  itemCode: string;
  name: string;
  stockQuantity: number;
  price: string;
  unit: string;
};

type ServicePart = {
  inventoryId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function NewServiceForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Vehicle & Customer
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 2: Service Details
  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mileage: "",
    description: "",
    notes: "",
    mechanicId: "",
  });

  // Step 3: Parts
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parts, setParts] = useState<ServicePart[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [partQty, setPartQty] = useState(1);

  useEffect(() => {
    fetch("/api/vehicles/all")
      .then((r) => r.json())
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => setVehicles([]));

    fetch("/api/inventory")
      .then((r) => r.json())
      .then((data) => setInventory(Array.isArray(data) ? data : []))
      .catch(() => setInventory([]));
  }, []);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      `${v.brand} ${v.model}`.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      (v.user.name || "").toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const filteredInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(partSearch.toLowerCase())
  );

  const addPart = () => {
    const inv = inventory.find((i) => i.id === selectedPart);
    if (!inv) return;
    const existing = parts.find((p) => p.inventoryId === inv.id);
    if (existing) {
      setParts(
        parts.map((p) =>
          p.inventoryId === inv.id
            ? { ...p, quantity: p.quantity + partQty }
            : p
        )
      );
    } else {
      setParts([
        ...parts,
        {
          inventoryId: inv.id,
          name: inv.name,
          quantity: partQty,
          unitPrice: Number(inv.price),
        },
      ]);
    }
    setSelectedPart("");
    setPartQty(1);
    setPartSearch("");
  };

  const removePart = (inventoryId: string) => {
    setParts(parts.filter((p) => p.inventoryId !== inventoryId));
  };

  const totalCost = parts.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      setError("Pilih kendaraan terlebih dahulu.");
      return;
    }
    if (!serviceForm.mileage || !serviceForm.description) {
      setError("Isi kilometer dan deskripsi servis.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: selectedVehicle.id,
        date: serviceForm.date,
        mileage: parseInt(serviceForm.mileage),
        description: serviceForm.description,
        notes: serviceForm.notes || null,
        mechanicId: serviceForm.mechanicId || null,
        totalCost,
        parts,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan servis.");
    } else {
      router.push("/admin/services");
      router.refresh();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">
          Input Servis Baru
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Pilih Kendaraan", "Detail Servis", "Sparepart & Konfirmasi"].map(
          (label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isDone ? "✓" : num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-gray-200 hidden sm:block" />}
              </div>
            );
          }
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Cari & Pilih Kendaraan
          </h2>

          <input
            type="text"
            placeholder="Cari berdasarkan nomor polisi, nama pelanggan..."
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          />

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredVehicles.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                Tidak ada kendaraan ditemukan.
              </p>
            ) : (
              filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-100 hover:border-red-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {vehicle.user.name || vehicle.user.email || "Pelanggan"}
                      </p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded-lg">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                if (!selectedVehicle) {
                  setError("Pilih kendaraan terlebih dahulu.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
            <div className="bg-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700">
              {selectedVehicle?.licensePlate}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedVehicle?.brand} {selectedVehicle?.model}
              </p>
              <p className="text-xs text-gray-500">
                {selectedVehicle?.user.name || selectedVehicle?.user.email}
              </p>
            </div>
          </div>

          <h2 className="font-semibold text-gray-900 mb-4">Detail Servis</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Servis
              </label>
              <input
                type="date"
                value={serviceForm.date}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, date: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kilometer Kendaraan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={serviceForm.mileage}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, mileage: e.target.value })
                }
                required
                min="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi Pekerjaan <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="e.g. Ganti oli mesin + filter, tune up..."
                value={serviceForm.description}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    description: e.target.value,
                  })
                }
                required
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Catatan Mekanik
              </label>
              <textarea
                placeholder="Catatan tambahan, rekomendasi, dll."
                value={serviceForm.notes}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, notes: e.target.value })
                }
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Kembali
            </button>
            <button
              onClick={() => {
                if (!serviceForm.mileage || !serviceForm.description) {
                  setError("Isi kilometer dan deskripsi servis.");
                  return;
                }
                setError("");
                setStep(3);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Parts selector */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Sparepart Digunakan
            </h2>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari sparepart..."
                  value={partSearch}
                  onChange={(e) => {
                    setPartSearch(e.target.value);
                    setSelectedPart("");
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {partSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredInventory.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => {
                          setSelectedPart(inv.id);
                          setPartSearch(inv.name);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center justify-between"
                      >
                        <span>
                          {inv.name}{" "}
                          <span className="text-gray-400 text-xs">
                            ({inv.itemCode})
                          </span>
                        </span>
                        <span className="text-gray-500 text-xs">
                          Stok: {inv.stockQuantity}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={partQty}
                onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
                min="1"
                className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={addPart}
                disabled={!selectedPart}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Tambah
              </button>
            </div>

            {parts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Belum ada sparepart ditambahkan.
              </p>
            ) : (
              <div className="space-y-2">
                {parts.map((part) => (
                  <div
                    key={part.inventoryId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {part.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {part.quantity} × Rp{" "}
                        {part.unitPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Rp{" "}
                      {(part.quantity * part.unitPrice).toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => removePart(part.inventoryId)}
                      className="text-red-400 hover:text-red-600 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Ringkasan Servis
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kendaraan</span>
                <span className="font-medium">
                  {selectedVehicle?.brand} {selectedVehicle?.model} -{" "}
                  {selectedVehicle?.licensePlate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium">
                  {new Date(serviceForm.date).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kilometer</span>
                <span className="font-medium">
                  {parseInt(serviceForm.mileage || "0").toLocaleString("id-ID")}{" "}
                  km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deskripsi</span>
                <span className="font-medium text-right max-w-xs">
                  {serviceForm.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jumlah Sparepart</span>
                <span className="font-medium">{parts.length} item</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between text-base">
                <span className="font-semibold text-gray-900">Total Biaya</span>
                <span className="font-bold text-red-600 text-lg">
                  Rp {totalCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Kembali
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      className="opacity-75"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Servis ✓"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
