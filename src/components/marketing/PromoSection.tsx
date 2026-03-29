"use client";

import { motion } from "framer-motion";

type Promo = {
  id: string;
  title: string;
  description: string;
  discount: number | null;
  validUntil: Date;
  image: string | null;
};

const MOCK_PROMOS: Promo[] = [
  {
    id: "1",
    title: "Ganti Oli Gratis Filter",
    description: "Setiap penggantian oli mesin, gratis penggantian filter oli. Berlaku untuk semua jenis kendaraan.",
    discount: 20,
    validUntil: new Date("2026-04-30"),
    image: null,
  },
  {
    id: "2",
    title: "Tune Up Hemat",
    description: "Paket tune up lengkap dengan harga spesial. Termasuk busi, filter udara, dan pengecekan 20 titik.",
    discount: 15,
    validUntil: new Date("2026-05-15"),
    image: null,
  },
  {
    id: "3",
    title: "Servis AC Premium",
    description: "Cuci AC + freon + pengecekan kompresor. Kendaraan Anda kembali segar dan nyaman.",
    discount: 25,
    validUntil: new Date("2026-04-20"),
    image: null,
  },
];

export default function PromoSection({ promos = MOCK_PROMOS }: { promos?: Promo[] }) {
  const displayPromos = promos.length > 0 ? promos : MOCK_PROMOS;

  return (
    <section id="promos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
            Penawaran Terbaik
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Promo Spesial Bulan Ini
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Dapatkan penawaran eksklusif untuk perawatan kendaraan Anda. Jangan
            lewatkan kesempatan emas ini!
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPromos.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 overflow-hidden"
            >
              {/* Card image / gradient */}
              <div className="h-40 bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
                {promo.discount && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-lg font-bold w-14 h-14 rounded-full flex items-center justify-center border border-white/30">
                    -{promo.discount}%
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <svg
                    className="w-10 h-10 text-white/30"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 6v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14z" />
                  </svg>
                </div>
              </div>

              {/* Card content */}
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors">
                  {promo.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {promo.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Berlaku s/d{" "}
                    {new Date(promo.validUntil).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button className="text-red-600 text-sm font-medium hover:underline">
                    Klaim &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
