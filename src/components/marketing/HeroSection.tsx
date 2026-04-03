"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING: { label: "Menunggu", color: "text-amber-700", bg: "bg-amber-100 border-amber-200", icon: "⏳" },
  IN_PROGRESS: { label: "Dalam Proses", color: "text-blue-700", bg: "bg-blue-100 border-blue-200", icon: "🔧" },
  COMPLETED: { label: "Selesai", color: "text-green-700", bg: "bg-green-100 border-green-200", icon: "✅" },
  CANCELLED: { label: "Dibatalkan", color: "text-gray-600", bg: "bg-gray-100 border-gray-200", icon: "❌" },
};

type ServiceResult = {
  found: boolean;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string | null;
  };
  services?: Array<{
    id: string;
    date: string;
    description: string;
    status: string;
    totalCost: string;
    mileage: number;
  }>;
};

export default function HeroSection() {
  const [searchPlate, setSearchPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const plate = searchPlate.trim().toUpperCase();
    if (!plate) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/cek-servis?plate=${encodeURIComponent(plate)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ found: false });
    }

    setLoading(false);
    setSearched(true);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-sm font-medium px-3 py-1 rounded-full border border-red-500/30 mb-6">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Bengkel Premium #1 Indonesia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Servis Kendaraan{" "}
              <span className="text-red-500">Lebih Cerdas</span> & Transparan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-gray-400 leading-relaxed"
            >
              Pantau status servis kendaraan Anda secara real-time. Riwayat
              lengkap, estimasi biaya transparan, dan mekanik berpengalaman
              siap melayani Anda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mt-8"
            >
              <Link
                href="/register"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 text-center"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/login"
                className="border border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-all text-center"
              >
                Masuk
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 mt-10"
            >
              {[
                { value: "50K+", label: "Kendaraan" },
                { value: "10+", label: "Tahun" },
                { value: "15", label: "Mekanik" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right content — Interactive Status Checker */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Cek Status Servis</h3>
                  <p className="text-gray-400 text-xs">Masukkan nomor polisi kendaraan</p>
                </div>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                  placeholder="B 1234 XYZ"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={loading || !searchPlate.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  Cek
                </button>
              </form>

              {/* Results — hidden until searched */}
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-4 justify-center">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      Mencari data...
                    </div>
                  </motion.div>
                )}

                {!loading && searched && result && !result.found && (
                  <motion.div
                    key="notfound"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-white text-sm font-medium">Kendaraan tidak ditemukan</p>
                      <p className="text-gray-400 text-xs mt-1">Nomor polisi tidak terdaftar</p>
                    </div>
                  </motion.div>
                )}

                {!loading && result?.found && result.vehicle && (
                  <motion.div
                    key="found"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    {/* Vehicle info */}
                    <div className="bg-white/10 rounded-xl p-4 mb-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚗</span>
                          <div>
                            <p className="text-white font-semibold text-sm">{result.vehicle.brand} {result.vehicle.model} {result.vehicle.year}</p>
                            <p className="text-gray-400 text-xs font-mono">{result.vehicle.licensePlate}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{result.services?.length || 0} servis</span>
                      </div>
                    </div>

                    {/* Latest service status */}
                    {result.services && result.services.length > 0 && (() => {
                      const latest = result.services[0];
                      const cfg = STATUS_CONFIG[latest.status] || STATUS_CONFIG.PENDING;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white/10 rounded-xl p-4 border border-white/10"
                        >
                          <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider font-medium">Status Terakhir</p>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{latest.description}</p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {new Date(latest.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })()}

                    <Link
                      href={`/cek-servis?plate=${encodeURIComponent(searchPlate.trim().toUpperCase())}`}
                      className="mt-3 w-full text-center text-xs text-red-400 hover:text-red-300 transition-colors block py-2"
                    >
                      Lihat riwayat lengkap →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Placeholder when not yet searched */}
              {!searched && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 flex items-center gap-3 text-gray-500 text-xs"
                >
                  <div className="flex -space-x-1">
                    {["🔵", "🟡", "🟢"].map((dot, i) => (
                      <span key={i} className="w-5 h-5 flex items-center justify-center">{dot}</span>
                    ))}
                  </div>
                  <span>Track status real-time kendaraan Anda</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
