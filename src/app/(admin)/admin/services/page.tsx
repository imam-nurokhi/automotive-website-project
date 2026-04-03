import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ServiceStatusUpdate from "@/components/admin/ServiceStatusUpdate";

export default async function AdminServicesPage() {
  const services = await prisma.serviceRecord.findMany({
    include: {
      vehicle: { include: { user: true } },
      mechanic: { select: { name: true } },
      serviceItems: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Servis</h1>
          <p className="text-gray-500 mt-1">
            {services.length} total record servis
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Servis Baru
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tanggal
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Kendaraan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pelanggan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Deskripsi
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-400 py-16 text-sm"
                  >
                    Belum ada data servis.
                  </td>
                </tr>
              ) : (
                services.map((service, i) => (
                  <tr
                    key={service.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      i < services.length - 1 ? "border-b border-gray-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(service.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {service.vehicle.brand} {service.vehicle.model}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {service.vehicle.licensePlate}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {service.vehicle.user.name ||
                        service.vehicle.user.email ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <p className="truncate">{service.description}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ServiceStatusUpdate id={service.id} currentStatus={service.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                      Rp{" "}
                      {Number(service.totalCost).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
