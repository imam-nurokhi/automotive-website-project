import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import VehiclesList from "@/components/dashboard/VehiclesList";

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    include: {
      serviceRecords: {
        orderBy: { date: "desc" },
        take: 1,
      },
      _count: { select: { serviceRecords: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kendaraan Saya</h1>
          <p className="text-gray-500 mt-1">{vehicles.length} kendaraan terdaftar</p>
        </div>
        <Link
          href="/dashboard/vehicles/add"
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          + Tambah Kendaraan
        </Link>
      </div>
      <VehiclesList vehicles={vehicles} />
    </div>
  );
}
