import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    include: {
      serviceRecords: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  const recentServices = await prisma.serviceRecord.findMany({
    where: { vehicle: { userId: session.user.id } },
    include: { vehicle: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Menunggu",
    IN_PROGRESS: "Dalam Proses",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {session.user.name || "Pelanggan"}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola kendaraan dan pantau status servis Anda di sini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Kendaraan Terdaftar",
            value: vehicles.length,
            icon: "🚗",
            color: "bg-blue-50 border-blue-100",
          },
          {
            label: "Total Servis",
            value: recentServices.length,
            icon: "🔧",
            color: "bg-green-50 border-green-100",
          },
          {
            label: "Servis Aktif",
            value: recentServices.filter(
              (s) => s.status === "IN_PROGRESS" || s.status === "PENDING"
            ).length,
            icon: "⚙️",
            color: "bg-amber-50 border-amber-100",
          },
          {
            label: "Servis Selesai",
            value: recentServices.filter((s) => s.status === "COMPLETED")
              .length,
            icon: "✅",
            color: "bg-red-50 border-red-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-5 ${stat.color}`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vehicles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Kendaraan Saya
          </h2>
          <Link
            href="/dashboard/vehicles/add"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
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
            Tambah Kendaraan
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-500">Belum ada kendaraan terdaftar.</p>
            <Link
              href="/dashboard/vehicles/add"
              className="mt-4 inline-block text-red-600 font-medium text-sm hover:underline"
            >
              Daftarkan kendaraan pertama Anda →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const lastService = vehicle.serviceRecords[0];
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-red-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {vehicle.year} • {vehicle.color || "—"}
                      </p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-lg tracking-wide">
                      {vehicle.licensePlate}
                    </span>
                  </div>

                  {lastService && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-xs text-gray-400">Servis Terakhir</p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {new Date(lastService.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <span
                        className={`mt-1 inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lastService.status]}`}
                      >
                        {statusLabels[lastService.status]}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Services */}
      {recentServices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Servis Terbaru
            </h2>
            <Link
              href="/dashboard/services"
              className="text-sm text-red-600 hover:underline font-medium"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {recentServices.map((service, i) => (
              <div
                key={service.id}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  i < recentServices.length - 1
                    ? "border-b border-gray-50"
                    : ""
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    service.status === "COMPLETED"
                      ? "bg-green-500"
                      : service.status === "IN_PROGRESS"
                        ? "bg-blue-500"
                        : service.status === "PENDING"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {service.vehicle.brand} {service.vehicle.model} •{" "}
                    {new Date(service.date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Rp{" "}
                    {Number(service.totalCost).toLocaleString("id-ID")}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[service.status]}`}
                  >
                    {statusLabels[service.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
