import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      vehicles: {
        include: {
          _count: { select: { serviceRecords: true } },
        },
      },
      _count: { select: { vehicles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Pelanggan</h1>
        <p className="text-gray-500 mt-1">{customers.length} pelanggan terdaftar</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telepon</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kendaraan</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Servis</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-16">Belum ada pelanggan.</td></tr>
              ) : (
                customers.map((customer, i) => {
                  const totalServices = customer.vehicles.reduce((acc, v) => acc + v._count.serviceRecords, 0);
                  return (
                    <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${i < customers.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                            {(customer.name || customer.email || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{customer.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{customer.phone || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">{customer._count.vehicles}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{totalServices}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(customer.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
