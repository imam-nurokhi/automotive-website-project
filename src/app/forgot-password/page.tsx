"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
            <p className="text-gray-500 mt-2 text-sm">Masukkan email Anda dan kami akan mengirimkan instruksi reset password.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">Email Terkirim!</h2>
              <p className="text-sm text-gray-500 mb-6">Cek inbox <strong>{email}</strong> untuk instruksi reset password.</p>
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium text-sm">← Kembali ke Login</Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 text-sm">
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Ingat password? <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">Masuk</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
