import HeroSection from "@/components/marketing/HeroSection";
import ServicesSection from "@/components/marketing/ServicesSection";
import PromoSection from "@/components/marketing/PromoSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PromoSection />

      {/* About section */}
      <section id="about" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-500 text-sm font-semibold uppercase tracking-wider">
                Tentang AutoFlow
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">
                Bengkel Modern dengan Standar Premium
              </h2>
              <p className="text-gray-400 mt-6 leading-relaxed">
                AutoFlow hadir sebagai solusi manajemen bengkel modern yang
                menggabungkan teknologi terkini dengan layanan pelanggan yang
                prima. Kami percaya bahwa transparansi dan kepercayaan adalah
                fondasi utama hubungan bengkel-pelanggan yang sehat.
              </p>
              <p className="text-gray-400 mt-4 leading-relaxed">
                Dengan sistem digital terintegrasi, pelanggan dapat memantau
                status servis kendaraan secara real-time, melihat riwayat
                servis lengkap, dan mendapatkan estimasi biaya yang transparan.
              </p>

              <div className="grid grid-cols-2 gap-6 mt-8">
                {[
                  { label: "Tahun Berpengalaman", value: "10+" },
                  { label: "Kendaraan Diservice", value: "50K+" },
                  { label: "Mekanik Bersertifikat", value: "15" },
                  { label: "Cabang Aktif", value: "3" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="text-2xl font-bold text-red-500">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Transparansi Penuh",
                  desc: "Setiap penggantian sparepart terdokumentasi dengan kode item dan harga yang jelas.",
                  icon: "🔍",
                },
                {
                  title: "Mekanik Bersertifikat",
                  desc: "Tim mekanik kami bersertifikat dan berpengalaman menangani berbagai merek kendaraan.",
                  icon: "🏆",
                },
                {
                  title: "Garansi Servis",
                  desc: "Setiap pekerjaan servis dilindungi garansi hingga 30 hari atau 1.000 km.",
                  icon: "✅",
                },
                {
                  title: "Layanan Darurat",
                  desc: "Tim siap membantu 24/7 untuk situasi darurat kendaraan Anda.",
                  icon: "🚨",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Siap Merasakan Pengalaman Servis Premium?
          </h2>
          <p className="text-red-100 mt-4">
            Daftar sekarang dan dapatkan diskon 10% untuk servis pertama Anda.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Daftar Gratis
            </Link>
            <Link
              href="/#services"
              className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Lihat Layanan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
