"use client";

import { motion } from "framer-motion";

type ServiceRecord = {
  id: string;
  date: Date;
  mileage: number;
  description: string;
  totalCost: number | string;
  status: string;
  notes: string | null;
  vehicle: { brand: string; model: string; licensePlate: string };
  serviceItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string;
    inventory: { name: string; itemCode: string };
  }>;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  IN_PROGRESS: "Dalam Proses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const statusDots: Record<string, string> = {
  PENDING: "bg-amber-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-gray-400",
};

export default function ServiceTimeline({
  services,
}: {
  services: ServiceRecord[];
}) {
  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔧</div>
        <p className="text-gray-500">Belum ada riwayat servis.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200 hidden sm:block" />

      <div className="space-y-6">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative sm:pl-12"
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-5 w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-sm hidden sm:flex ${statusDots[service.status]} bg-opacity-20`}
            >
              <div
                className={`w-3 h-3 rounded-full ${statusDots[service.status]}`}
              />
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-red-100 hover:shadow-md transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {service.vehicle.brand} {service.vehicle.model} (
                    {service.vehicle.licensePlate}) •{" "}
                    {new Date(service.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColors[service.status]}`}
                >
                  {statusLabels[service.status]}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400">Kilometer</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {service.mileage.toLocaleString("id-ID")} km
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400">Total Biaya</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    Rp {Number(service.totalCost).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400">Sparepart</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {service.serviceItems.length} item
                  </p>
                </div>
              </div>

              {service.serviceItems.length > 0 && (
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-400 mb-2">
                    Parts Diganti:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.serviceItems.map((item) => (
                      <span
                        key={item.id}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {item.inventory.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {service.notes && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-1">Catatan Mekanik:</p>
                  <p className="text-sm text-gray-600 italic">
                    &quot;{service.notes}&quot;
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
