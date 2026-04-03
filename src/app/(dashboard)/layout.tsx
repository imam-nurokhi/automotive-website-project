import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import PageTransition from "@/components/dashboard/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar / Top nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">AutoFlow</span>
              </Link>

              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/vehicles"
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  Kendaraan
                </Link>
                <Link
                  href="/dashboard/services"
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
                >
                  Riwayat Servis
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name || session.user?.email}
                </p>
                <p className="text-xs text-gray-500">Pelanggan</p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
