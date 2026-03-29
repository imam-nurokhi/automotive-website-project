"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">AutoFlow</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#services"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Layanan
            </Link>
            <Link
              href="/#promos"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Promo
            </Link>
            <Link
              href="/#about"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Tentang Kami
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-2 border-t border-gray-100"
          >
            <Link
              href="/#services"
              className="block px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Layanan
            </Link>
            <Link
              href="/#promos"
              className="block px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Promo
            </Link>
            <Link
              href="/#about"
              className="block px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="block mx-4 text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
            >
              Daftar Sekarang
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
