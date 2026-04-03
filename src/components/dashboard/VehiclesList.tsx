"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Vehicle = {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  engineCC: number | null;
  _count: { serviceRecords: number };
  serviceRecords: Array<{ date: Date; description: string }>;
};

export default function VehiclesList({ vehicles: initial }: { vehicles: Vehicle[] }) {
  const [vehicles, setVehicles] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Hapus kendaraan ini? Semua data servis terkait akan ikut terhapus.")) return;
    setDeleting(id);
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVehicles(v => v.filter(x => x.id !== id));
      router.refresh();
    } else {
      alert("Gagal menghapus kendaraan.");
    }
    setDeleting(null);
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
        <div className="text-5xl mb-4">🚗</div>
        <p className="text-gray-500 mb-4">Belum ada kendaraan terdaftar.</p>
        <Link href="/dashboard/vehicles/add" className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">Tambah Kendaraan</Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((v, i) => (
        <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-red-100 transition-all"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">🚗</div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">{v.licensePlate}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">{v.brand} {v.model}</h3>
          <p className="text-gray-500 text-sm">{v.year}{v.color ? ` · ${v.color}` : ""}{v.engineCC ? ` · ${v.engineCC}cc` : ""}</p>
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>🔧 {v._count.serviceRecords} servis</span>
            {v.serviceRecords[0] && <span>Terakhir: {new Date(v.serviceRecords[0].date).toLocaleDateString("id-ID")}</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <Link href={`/dashboard/vehicles/${v.id}`} className="flex-1 text-center text-xs bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl transition-colors font-medium">Lihat Detail</Link>
            <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id}
              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              {deleting === v.id ? "..." : "Hapus"}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
