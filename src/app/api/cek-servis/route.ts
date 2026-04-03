import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const plate = req.nextUrl.searchParams.get("plate");
  if (!plate || plate.trim().length < 2) {
    return NextResponse.json({ error: "Nomor polisi tidak valid." }, { status: 400 });
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        licensePlate: {
          equals: plate.trim().toUpperCase(),
          mode: "insensitive",
        },
      },
      include: {
        serviceRecords: {
          include: {
            mechanic: { select: { name: true } },
            serviceItems: {
              include: { inventory: { select: { name: true, itemCode: true } } },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ found: false, vehicle: null, services: [] });
    }

    // Serialize decimals
    const services = vehicle.serviceRecords.map((s) => ({
      ...s,
      totalCost: s.totalCost.toString(),
      serviceItems: s.serviceItems.map((si) => ({
        ...si,
        unitPrice: si.unitPrice.toString(),
      })),
    }));

    return NextResponse.json({
      found: true,
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        engineCC: vehicle.engineCC,
      },
      services,
    });
  } catch (err) {
    console.error("[CEK-SERVIS]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
