"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear().toString(),
    color: "",
    engineCC: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        licensePlate: form.licensePlate.toUpperCase().replace(/\s+/g, " ").trim(),
        year: parseInt(form.year),
        engineCC: form.engineCC ? parseInt(form.engineCC) : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menambahkan kendaraan.");
    } else {
      router.push("/dashboard/vehicles");
      router.refresh();
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
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
          Tambah Kendaraan
        </h1>
        <p className="text-gray-500 mt-1">
          Daftarkan kendaraan Anda untuk memantau riwayat servis.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nomor Polisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={form.licensePlate}
                onChange={handleChange}
                required
                placeholder="B 1234 XYZ"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Merek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                placeholder="Toyota, Honda, dll."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                placeholder="Avanza, Civic, dll."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tahun <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                min="1980"
                max={currentYear + 1}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Warna
              </label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Putih, Hitam, dll."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kapasitas Mesin (CC)
              </label>
              <input
                type="number"
                name="engineCC"
                value={form.engineCC}
                onChange={handleChange}
                placeholder="1500"
                min="50"
                max="10000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Catatan
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Tambahkan catatan tentang kendaraan ini..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan Kendaraan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
