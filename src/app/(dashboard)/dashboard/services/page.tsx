import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ServiceTimeline from "@/components/dashboard/ServiceTimeline";

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const services = await prisma.serviceRecord.findMany({
    where: { vehicle: { userId: session.user.id } },
    include: {
      vehicle: true,
      serviceItems: {
        include: { inventory: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const serialized = services.map((s) => ({
    ...s,
    totalCost: s.totalCost.toString(),
    serviceItems: s.serviceItems.map((si) => ({
      ...si,
      unitPrice: si.unitPrice.toString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Servis</h1>
        <p className="text-gray-500 mt-1">
          Semua riwayat servis kendaraan Anda.
        </p>
      </div>

      <ServiceTimeline services={serialized} />
    </div>
  );
}
