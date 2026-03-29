"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [searchPlate, setSearchPlate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlate.trim()) {
      window.location.href = `/cek-servis?plate=${encodeURIComponent(searchPlate)}`;
    }
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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

            {/* Search form */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="mt-8"
            >
              <p className="text-sm text-gray-400 mb-3">
                Cek Status Servis Kendaraan
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Masukkan Nomor Polisi (e.g. B 1234 XYZ)"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:bg-white/15 transition-all min-w-0"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Cek Status
                </button>
              </div>
            </motion.form>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "5.000+", label: "Pelanggan Puas" },
                { value: "15+", label: "Mekanik Ahli" },
                { value: "99%", label: "Kepuasan Klien" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="glass-dark rounded-2xl p-6 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-xs">Status Servis</p>
                  <p className="text-white font-semibold">B 1234 XYZ</p>
                </div>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30">
                  In Progress
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: "Diagnosa",
                    time: "08:00",
                    done: true,
                    desc: "Pemeriksaan awal selesai",
                  },
                  {
                    step: "Penggantian Oli",
                    time: "09:30",
                    done: true,
                    desc: "Shell Helix Ultra 5W-40",
                  },
                  {
                    step: "Ganti Filter Udara",
                    time: "10:15",
                    done: false,
                    desc: "Sedang dalam proses",
                  },
                  {
                    step: "Pengecekan Rem",
                    time: "11:00",
                    done: false,
                    desc: "Menunggu giliran",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.done
                            ? "bg-green-500/20 border border-green-500/50"
                            : "bg-white/10 border border-white/20"
                        }`}
                      >
                        {item.done ? (
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        )}
                      </div>
                      {i < 3 && (
                        <div className="w-px h-6 bg-white/10 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${item.done ? "text-white" : "text-gray-500"}`}
                        >
                          {item.step}
                        </p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Estimasi Biaya</p>
                  <p className="text-white font-semibold">Rp 750.000</p>
                </div>
                <Link
                  href="/dashboard"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.div>
    </section>
  );
}
