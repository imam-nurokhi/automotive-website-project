import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers,
    totalVehicles,
    totalServices,
    servicesThisMonth,
    allInventory,
    recentServices,
    topParts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.vehicle.count(),
    prisma.serviceRecord.count(),
    prisma.serviceRecord.findMany({
      where: { date: { gte: startOfMonth } },
      select: { totalCost: true, status: true },
    }),
    // Fetch inventory and filter low stock items in JS (Prisma can't compare two columns directly)
    prisma.inventory.findMany({
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.serviceRecord.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.serviceItem.groupBy({
      by: ["inventoryId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Filter low stock items in JavaScript (stockQuantity <= minimumThreshold)
  const lowStockItems = allInventory
    .filter((item) => item.stockQuantity <= item.minimumThreshold)
    .slice(0, 5);

  const revenueThisMonth = servicesThisMonth
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + Number(s.totalCost), 0);

  const pendingServices = await prisma.serviceRecord.count({
    where: { status: "PENDING" },
  });

  const inProgressServices = await prisma.serviceRecord.count({
    where: { status: "IN_PROGRESS" },
  });

  // Get inventory names for top parts
  const inventoryIds = topParts.map((p) => p.inventoryId);
  const inventories = await prisma.inventory.findMany({
    where: { id: { in: inventoryIds } },
    select: { id: true, name: true, itemCode: true },
  });

  const topPartsWithNames = topParts.map((p) => ({
    ...p,
    name:
      inventories.find((inv) => inv.id === p.inventoryId)?.name || "Unknown",
    itemCode:
      inventories.find((inv) => inv.id === p.inventoryId)?.itemCode || "—",
  }));

  // Monthly revenue for chart (last 6 months)
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return prisma.serviceRecord
        .findMany({
          where: {
            date: { gte: start, lte: end },
            status: "COMPLETED",
          },
          select: { totalCost: true },
        })
        .then((records) => ({
          month: start.toLocaleDateString("id-ID", { month: "short" }),
          revenue: records.reduce((sum, r) => sum + Number(r.totalCost), 0),
        }));
    })
  );

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">
            Selamat datang,{" "}
            <span className="font-medium">{session.user?.name}</span>
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

      {/* KPI Cards - Bento style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue Bulan Ini",
            value: `Rp ${(revenueThisMonth / 1000000).toFixed(1)}jt`,
            change: `${servicesThisMonth.length} transaksi`,
            icon: "💰",
            color: "from-green-500 to-emerald-600",
          },
          {
            label: "Total Pelanggan",
            value: totalCustomers.toLocaleString(),
            change: `${totalVehicles} kendaraan`,
            icon: "👥",
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Servis Aktif",
            value: pendingServices + inProgressServices,
            change: `${inProgressServices} sedang proses`,
            icon: "⚙️",
            color: "from-amber-500 to-orange-500",
          },
          {
            label: "Total Servis",
            value: totalServices.toLocaleString(),
            change: "Sepanjang waktu",
            icon: "🔧",
            color: "from-red-500 to-red-600",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white`}
          >
            <div className="text-2xl mb-3">{kpi.icon}</div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs opacity-80 mt-1">{kpi.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Revenue 6 Bulan Terakhir
          </h2>
          <AdminAnalytics monthlyData={monthlyData} />
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">⚠️ Stok Menipis</h2>
            <Link
              href="/admin/inventory"
              className="text-xs text-red-600 hover:underline"
            >
              Kelola →
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Semua stok aman ✅
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.itemCode}</p>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full pulse-red" />
                      <span className="text-sm font-bold text-red-600">
                        {item.stockQuantity}
                      </span>
                    </span>
                    <p className="text-xs text-gray-400">
                      min: {item.minimumThreshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Services */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Servis Terbaru</h2>
            <Link
              href="/admin/services"
              className="text-xs text-red-600 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="space-y-3">
            {recentServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {service.vehicle.brand} {service.vehicle.model} •{" "}
                    {service.vehicle.licensePlate}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${statusColors[service.status]}`}
                >
                  {statusLabels[service.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Parts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Sparepart Terlaris
          </h2>

          {topPartsWithNames.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Belum ada data penggunaan sparepart.
            </p>
          ) : (
            <div className="space-y-3">
              {topPartsWithNames.map((part, i) => (
                <div key={part.inventoryId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {part.name}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {part._sum.quantity || 0}×
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, ((part._sum.quantity || 0) / (topPartsWithNames[0]._sum.quantity || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
