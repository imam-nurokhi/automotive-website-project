"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Promo = {
  id: string;
  title: string;
  description: string;
  discount: number | null;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
};

type PromoForm = { title: string; description: string; discount: string; validUntil: string; isActive: boolean };
const emptyForm: PromoForm = { title: "", description: "", discount: "", validUntil: "", isActive: true };

export default function PromoManager({ promos: initial }: { promos: Promo[] }) {
  const [promos, setPromos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function startEdit(p: Promo) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      discount: p.discount?.toString() ?? "",
      validUntil: new Date(p.validUntil).toISOString().split("T")[0],
      isActive: p.isActive,
    });
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = { ...form, discount: form.discount ? Number(form.discount) : null };
    const isEdit = !!editingId;
    const res = await fetch(isEdit ? `/api/promos/${editingId}` : "/api/promos", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Gagal menyimpan promo."); setLoading(false); return; }
    if (isEdit) {
      setPromos(ps => ps.map(p => p.id === editingId ? { ...p, ...data } : p));
      setEditingId(null);
    } else {
      setPromos(ps => [data, ...ps]);
      setShowForm(false);
    }
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus promo ini?")) return;
    const res = await fetch(`/api/promos/${id}`, { method: "DELETE" });
    if (res.ok) setPromos(ps => ps.filter(p => p.id !== id));
    else alert("Gagal menghapus promo.");
    router.refresh();
  }

  async function toggleActive(p: Promo) {
    const res = await fetch(`/api/promos/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) setPromos(ps => ps.map(x => x.id === p.id ? { ...x, isActive: !p.isActive } : x));
  }

  const PromoFormFields = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">{editingId ? "Edit Promo" : "Promo Baru"}</h3>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Judul *</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Diskon (%)</label>
          <input type="number" min="0" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">Deskripsi *</label>
          <textarea required rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Berlaku Hingga *</label>
          <input required type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-red-600" />
          <label htmlFor="isActive" className="text-sm text-gray-700">Aktif</label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan Promo"}</button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">Batal</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {!showForm && !editingId && (
        <div className="flex justify-end">
          <button onClick={() => { setShowForm(true); setForm(emptyForm); }} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">+ Tambah Promo</button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div key="form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <PromoFormFields onCancel={() => { setShowForm(false); setForm(emptyForm); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {promos.length === 0 && !showForm && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-500">Belum ada promo. Buat promo pertama!</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo, i) => (
          <motion.div key={promo.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            {editingId === promo.id ? (
              <PromoFormFields onCancel={() => { setEditingId(null); setForm(emptyForm); }} />
            ) : (
              <div className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${promo.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{promo.title}</h3>
                  {promo.discount && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">{promo.discount}%</span>}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{promo.description}</p>
                <p className="text-xs text-gray-400">Sampai: {new Date(promo.validUntil).toLocaleDateString("id-ID")}</p>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <button onClick={() => toggleActive(promo)} className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${promo.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {promo.isActive ? "✓ Aktif" : "Nonaktif"}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(promo)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1 rounded-xl transition-colors">Edit</button>
                    <button onClick={() => handleDelete(promo.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-xl transition-colors">Hapus</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
