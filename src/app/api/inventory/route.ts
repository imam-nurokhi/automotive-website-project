import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const inventory = await prisma.inventory.findMany({
    orderBy: { category: "asc" },
  });
  return NextResponse.json(inventory);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MECHANIC"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      itemCode,
      name,
      category,
      stockQuantity,
      minimumThreshold,
      price,
      unit,
      description,
    } = await req.json();

    if (!itemCode || !name || !price) {
      return NextResponse.json(
        { error: "Kode item, nama, dan harga wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.inventory.findUnique({ where: { itemCode } });
    if (existing) {
      return NextResponse.json(
        { error: "Kode item sudah digunakan." },
        { status: 409 }
      );
    }

    const item = await prisma.inventory.create({
      data: {
        itemCode,
        name,
        category: category || "OTHER",
        stockQuantity: stockQuantity || 0,
        minimumThreshold: minimumThreshold || 5,
        price,
        unit: unit || "pcs",
        description: description || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[INVENTORY POST]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
