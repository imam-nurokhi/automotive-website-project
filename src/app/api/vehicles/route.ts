import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { licensePlate, brand, model, year, color, engineCC, notes } =
      await req.json();

    if (!licensePlate || !brand || !model || !year) {
      return NextResponse.json(
        { error: "Nomor polisi, merek, model, dan tahun wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Nomor polisi sudah terdaftar." },
        { status: 409 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        brand,
        model,
        year,
        color: color || null,
        engineCC: engineCC || null,
        notes: notes || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (err) {
    console.error("[VEHICLES POST]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
