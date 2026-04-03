import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import AdminPageTransition from "@/components/admin/AdminPageTransition";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN" && session.user?.role !== "MECHANIC") {
    redirect("/dashboard");
  }

  const isAdmin = session.user?.role === "ADMIN";

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/services", label: "Servis", icon: "🔧" },
    { href: "/admin/inventory", label: "Inventori", icon: "📦" },
    ...(isAdmin
      ? [
          { href: "/admin/customers", label: "Pelanggan", icon: "👥" },
          { href: "/admin/promos", label: "Promo", icon: "🎯" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
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
            <div>
              <span className="font-bold text-white">AutoFlow</span>
              <p className="text-xs text-gray-400">
                {isAdmin ? "Admin CMS" : "Mekanik"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 text-sm font-bold">
                {(session.user?.name || "A")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name || session.user?.email}
              </p>
              <p className="text-xs text-gray-400">{session.user?.role}</p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10"
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
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
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
            <span className="font-bold text-gray-900">AutoFlow Admin</span>
          </Link>

          <div className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all text-xs font-medium whitespace-nowrap"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <AdminPageTransition>{children}</AdminPageTransition>
        </main>
      </div>
    </div>
  );
}
