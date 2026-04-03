import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ServiceTimeline from "@/components/dashboard/ServiceTimeline";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      serviceRecords: {
        include: {
          serviceItems: {
            include: { inventory: true },
          },
          mechanic: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!vehicle) notFound();

  // Security: customers can only view their own vehicles
  if (session.user.role === "CUSTOMER" && vehicle.userId !== session.user.id) {
    redirect("/dashboard/vehicles");
  }

  const serializedServices = vehicle.serviceRecords.map((s) => ({
    ...s,
    totalCost: s.totalCost.toString(),
    vehicle: {
      brand: vehicle.brand,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
    },
    serviceItems: s.serviceItems.map((si) => ({
      ...si,
      unitPrice: si.unitPrice.toString(),
    })),
  }));

  const totalCost = vehicle.serviceRecords.reduce(
    (acc, s) => acc + Number(s.totalCost),
    0
  );

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/dashboard/vehicles"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar Kendaraan
      </Link>

      {/* Vehicle info card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl">🚗</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="bg-gray-100 text-gray-700 text-sm px-3 py-0.5 rounded-full font-mono font-medium">
                  {vehicle.licensePlate}
                </span>
                <span className="text-gray-500 text-sm">Tahun {vehicle.year}</span>
                {vehicle.color && <span className="text-gray-500 text-sm">· {vehicle.color}</span>}
                {vehicle.engineCC && <span className="text-gray-500 text-sm">· {vehicle.engineCC}cc</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center bg-red-50 rounded-2xl px-4 py-3">
              <p className="text-2xl font-bold text-red-600">{vehicle.serviceRecords.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Servis</p>
            </div>
            <div className="text-center bg-gray-50 rounded-2xl px-4 py-3">
              <p className="text-lg font-bold text-gray-900">Rp {(totalCost / 1000000).toFixed(1)}jt</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Biaya</p>
            </div>
          </div>
        </div>

        {vehicle.serviceRecords[0] && (
          <div className="mt-4 pt-4 border-t border-gray-50 grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Servis Terakhir</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {new Date(vehicle.serviceRecords[0].date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Kilometer Terakhir</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {vehicle.serviceRecords[0].mileage.toLocaleString("id-ID")} km
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Status Terakhir</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {vehicle.serviceRecords[0].status === "COMPLETED" ? "✅ Selesai" :
                 vehicle.serviceRecords[0].status === "IN_PROGRESS" ? "🔵 Dalam Proses" :
                 vehicle.serviceRecords[0].status === "PENDING" ? "🟡 Menunggu" : "⚫ Dibatalkan"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Service history */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Servis</h2>
        <ServiceTimeline services={serializedServices} />
      </div>
    </div>
  );
}
