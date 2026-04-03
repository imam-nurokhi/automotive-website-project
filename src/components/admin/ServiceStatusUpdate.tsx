"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "PENDING", label: "Menunggu", color: "bg-amber-100 text-amber-700" },
  { value: "IN_PROGRESS", label: "Dalam Proses", color: "bg-blue-100 text-blue-700" },
  { value: "COMPLETED", label: "Selesai", color: "bg-green-100 text-green-700" },
  { value: "CANCELLED", label: "Dibatalkan", color: "bg-gray-100 text-gray-600" },
];

export default function ServiceStatusUpdate({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function update(newStatus: string) {
    setLoading(true);
    setOpen(false);
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); router.refresh(); }
    setLoading(false);
  }

  const current = STATUSES.find(s => s.value === status);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(o => !o)} disabled={loading}
        className={`text-xs font-medium px-3 py-1 rounded-full border border-transparent transition-all ${current?.color} ${loading ? "opacity-50" : "hover:opacity-80 cursor-pointer"} flex items-center gap-1`}
      >
        {loading ? "..." : current?.label}
        <span className="text-[10px]">▼</span>
      </button>
      {open && (
        <div className="absolute z-10 top-8 left-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => update(s.value)}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${s.value === status ? "bg-gray-50" : ""}`}
            >
              <span className={`inline-block px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
