import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      where: { isActive: true, validUntil: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promos);
  } catch (err) {
    console.error("[PROMOS GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { title, description, discount, validUntil, isActive } = await req.json();
    if (!title || !description || !validUntil) {
      return NextResponse.json({ error: "Judul, deskripsi, dan tanggal berlaku wajib diisi." }, { status: 400 });
    }
    const promo = await prisma.promo.create({
      data: { title, description, discount: discount ?? null, validUntil: new Date(validUntil), isActive: isActive ?? true },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    console.error("[PROMOS POST]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
