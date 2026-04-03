import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PromoManager from "@/components/admin/PromoManager";

export default async function AdminPromosPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const promos = await prisma.promo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Promo</h1>
        <p className="text-gray-500 mt-1">Kelola penawaran dan promosi bengkel.</p>
      </div>
      <PromoManager promos={promos} />
    </div>
  );
}
