"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: "Menunggu", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  IN_PROGRESS: { label: "Dalam Proses", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  CANCELLED: { label: "Dibatalkan", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

type ServiceRecord = {
  id: string;
  date: string;
  mileage: number;
  description: string;
  totalCost: string;
  status: string;
  notes: string | null;
  mechanic: { name: string } | null;
  serviceItems: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    inventory: { name: string; itemCode: string };
  }>;
};

type Vehicle = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  engineCC: number | null;
};

type Result = {
  found: boolean;
  vehicle: Vehicle | null;
  services: ServiceRecord[];
};

function CekServisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plate, setPlate] = useState(searchParams.get("plate") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function fetchStatus(plateValue: string) {
    if (!plateValue.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/cek-servis?plate=${encodeURIComponent(plateValue.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data.");
      setResult(data);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const p = searchParams.get("plate");
    if (p) {
      setPlate(p);
      fetchStatus(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/cek-servis?plate=${encodeURIComponent(plate.trim().toUpperCase())}`, { scroll: false });
    fetchStatus(plate);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-sm font-medium px-3 py-1 rounded-full border border-red-500/30 mb-4">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Cek Status Servis
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Status Kendaraan</h1>
            <p className="text-gray-400">Masukkan nomor polisi untuk melihat riwayat dan status servis kendaraan Anda.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="mt-8 flex gap-3"
          >
            <input
              type="text"
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              placeholder="Contoh: B 1234 XYZ"
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-wider"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Mencari...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cek Status
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 -mt-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center gap-3 text-gray-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                <span>Mencari data kendaraan...</span>
              </div>
            </motion.div>
          )}

          {!loading && searched && result && !result.found && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-16 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white font-semibold text-lg mb-2">Kendaraan Tidak Ditemukan</h3>
              <p className="text-gray-400 text-sm">Nomor polisi <span className="font-mono text-white">{plate}</span> tidak terdaftar dalam sistem kami.</p>
              <p className="text-gray-500 text-xs mt-2">Pastikan nomor polisi sudah benar atau hubungi bengkel kami.</p>
            </motion.div>
          )}

          {!loading && result?.found && result.vehicle && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Vehicle Card */}
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">🚗</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{result.vehicle.brand} {result.vehicle.model} {result.vehicle.year}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="bg-gray-100 text-gray-700 text-sm px-3 py-0.5 rounded-full font-mono font-medium">{result.vehicle.licensePlate}</span>
                        {result.vehicle.color && <span className="text-gray-500 text-sm">{result.vehicle.color}</span>}
                        {result.vehicle.engineCC && <span className="text-gray-500 text-sm">{result.vehicle.engineCC}cc</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{result.services.length}</p>
                    <p className="text-xs text-gray-500">Total Servis</p>
                  </div>
                </div>
              </div>

              {/* Service Timeline */}
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Riwayat Servis
              </h3>

              {result.services.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-4xl mb-3">🔧</div>
                  <p className="text-gray-400">Belum ada riwayat servis.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.services.map((service, i) => {
                    const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.PENDING;
                    return (
                      <motion.div key={service.id}
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="bg-white rounded-2xl p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{service.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(service.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                              {service.mechanic && ` · Mekanik: ${service.mechanic.name}`}
                              {` · ${service.mileage.toLocaleString("id-ID")} km`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                            <span className="font-bold text-gray-900 text-sm whitespace-nowrap">Rp {Number(service.totalCost).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                        {service.serviceItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-50">
                            <p className="text-xs font-medium text-gray-500 mb-2">Sparepart digunakan:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {service.serviceItems.map(si => (
                                <span key={si.id} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-100">
                                  {si.inventory.name} ×{si.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {service.notes && (
                          <p className="mt-2 text-xs text-gray-500 italic">📝 {service.notes}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm mb-3">Ingin memantau servis secara lengkap?</p>
                <Link href="/register" className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm inline-block">
                  Daftar Sekarang
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CekServisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-gray-400">Memuat...</div>
      </div>
    }>
      <CekServisContent />
    </Suspense>
  );
}
