import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ServicePart = {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
};

export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MECHANIC"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.serviceRecord.findMany({
    include: {
      vehicle: { include: { user: true } },
      mechanic: { select: { id: true, name: true } },
      serviceItems: { include: { inventory: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MECHANIC"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      vehicleId,
      date,
      mileage,
      description,
      notes,
      mechanicId,
      totalCost,
      parts,
    } = await req.json();

    if (!vehicleId || !mileage || !description) {
      return NextResponse.json(
        { error: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    // Transactional: create service record + service items + deduct stock
    const result = await prisma.$transaction(async (tx) => {
      // Validate stock availability
      for (const part of parts as ServicePart[]) {
        const inv = await tx.inventory.findUnique({
          where: { id: part.inventoryId },
        });
        if (!inv) {
          throw new Error(`Item inventori tidak ditemukan: ${part.inventoryId}`);
        }
        if (inv.stockQuantity < part.quantity) {
          throw new Error(
            `Stok tidak cukup untuk ${inv.name}. Tersedia: ${inv.stockQuantity}`
          );
        }
      }

      // Create service record
      const serviceRecord = await tx.serviceRecord.create({
        data: {
          vehicleId,
          date: new Date(date),
          mileage,
          description,
          notes: notes || null,
          mechanicId: mechanicId || session.user.id,
          totalCost,
          status: "PENDING",
        },
      });

      // Create service items and deduct stock
      for (const part of parts as ServicePart[]) {
        await tx.serviceItem.create({
          data: {
            serviceRecordId: serviceRecord.id,
            inventoryId: part.inventoryId,
            quantity: part.quantity,
            unitPrice: part.unitPrice,
          },
        });

        await tx.inventory.update({
          where: { id: part.inventoryId },
          data: { stockQuantity: { decrement: part.quantity } },
        });
      }

      return serviceRecord;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server.";
    console.error("[SERVICES POST]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
