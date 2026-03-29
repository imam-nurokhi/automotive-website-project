import { prisma } from "@/lib/prisma";
import InventoryTable from "@/components/admin/InventoryTable";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    orderBy: { category: "asc" },
  });

  const serialized = inventory.map((item) => ({
    ...item,
    price: item.price.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Inventori
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola stok sparepart dan suku cadang bengkel.
          </p>
        </div>
      </div>

      <InventoryTable inventory={serialized} />
    </div>
  );
}
