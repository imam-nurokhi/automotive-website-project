"use client";

import { motion } from "framer-motion";

const services = [
  {
    icon: "🔧",
    title: "Tune Up & Service Berkala",
    desc: "Perawatan rutin untuk menjaga performa kendaraan tetap optimal.",
  },
  {
    icon: "🛢️",
    title: "Ganti Oli & Filter",
    desc: "Penggantian oli mesin dengan produk berkualitas dari brand terpercaya.",
  },
  {
    icon: "🔋",
    title: "Aki & Kelistrikan",
    desc: "Diagnosa dan perbaikan sistem kelistrikan kendaraan Anda.",
  },
  {
    icon: "❄️",
    title: "Servis AC",
    desc: "Perawatan dan isi freon AC agar kendaraan tetap sejuk.",
  },
  {
    icon: "🚗",
    title: "Rem & Suspensi",
    desc: "Pengecekan dan penggantian komponen rem dan suspensi.",
  },
  {
    icon: "🔍",
    title: "Diagnosa Engine",
    desc: "Scan OBD2 dan diagnosa mendalam untuk menemukan masalah tersembunyi.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
            Layanan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Solusi Lengkap untuk Kendaraan Anda
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
