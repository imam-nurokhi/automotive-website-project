import { NextResponse } from "next/server";
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
