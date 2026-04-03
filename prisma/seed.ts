import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@autoflow.id" },
    update: {},
    create: {
      name: "Admin AutoFlow",
      email: "admin@autoflow.id",
      password: adminPassword,
      role: "ADMIN",
      phone: "08123456789",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create mechanic
  const mechanicPassword = await bcrypt.hash("mechanic123456", 12);
  const mechanic = await prisma.user.upsert({
    where: { email: "mekanik@autoflow.id" },
    update: {},
    create: {
      name: "Budi Mekanik",
      email: "mekanik@autoflow.id",
      password: mechanicPassword,
      role: "MECHANIC",
      phone: "08234567890",
    },
  });
  console.log("✅ Mechanic created:", mechanic.email);

  // Create customer
  const customerPassword = await bcrypt.hash("customer123456", 12);
  const customer = await prisma.user.upsert({
    where: { email: "pelanggan@autoflow.id" },
    update: {},
    create: {
      name: "Andi Santoso",
      email: "pelanggan@autoflow.id",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "08345678901",
    },
  });
  console.log("✅ Customer created:", customer.email);

  // Create vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { licensePlate: "B 1234 XYZ" },
    update: {},
    create: {
      licensePlate: "B 1234 XYZ",
      brand: "Toyota",
      model: "Avanza",
      year: 2020,
      color: "Putih",
      engineCC: 1500,
      userId: customer.id,
    },
  });
  console.log("✅ Vehicle created:", vehicle.licensePlate);

  // Create inventory items
  const inventoryItems = [
    {
      itemCode: "OIL-001",
      name: "Oli Mesin Shell Helix Ultra 5W-40",
      category: "OIL" as const,
      stockQuantity: 50,
      minimumThreshold: 10,
      price: 120000,
      unit: "ltr",
    },
    {
      itemCode: "OIL-002",
      name: "Oli Mesin Castrol GTX 10W-40",
      category: "OIL" as const,
      stockQuantity: 30,
      minimumThreshold: 10,
      price: 85000,
      unit: "ltr",
    },
    {
      itemCode: "FLT-001",
      name: "Filter Oli Toyota",
      category: "FILTER" as const,
      stockQuantity: 25,
      minimumThreshold: 5,
      price: 45000,
      unit: "pcs",
    },
    {
      itemCode: "FLT-002",
      name: "Filter Udara Toyota Avanza",
      category: "FILTER" as const,
      stockQuantity: 4,
      minimumThreshold: 5,
      price: 75000,
      unit: "pcs",
    },
    {
      itemCode: "BRK-001",
      name: "Kampas Rem Depan Toyota",
      category: "BRAKE" as const,
      stockQuantity: 8,
      minimumThreshold: 4,
      price: 250000,
      unit: "set",
    },
    {
      itemCode: "ELC-001",
      name: "Busi NGK Iridium",
      category: "ELECTRICAL" as const,
      stockQuantity: 20,
      minimumThreshold: 8,
      price: 65000,
      unit: "pcs",
    },
    {
      itemCode: "ELC-002",
      name: "Aki GS Astra 45AH",
      category: "ELECTRICAL" as const,
      stockQuantity: 3,
      minimumThreshold: 3,
      price: 750000,
      unit: "pcs",
    },
    {
      itemCode: "ENG-001",
      name: "Timing Belt Toyota",
      category: "ENGINE" as const,
      stockQuantity: 5,
      minimumThreshold: 2,
      price: 320000,
      unit: "pcs",
    },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.upsert({
      where: { itemCode: item.itemCode },
      update: {},
      create: item,
    });
  }
  console.log(`✅ Created ${inventoryItems.length} inventory items`);

  // Create promos (clear existing first to avoid duplicates)
  await prisma.promo.deleteMany({});
  const promos = [
    {
      title: "Ganti Oli Gratis Filter",
      description:
        "Setiap penggantian oli mesin, gratis penggantian filter oli. Berlaku untuk semua jenis kendaraan.",
      discount: 20,
      validUntil: new Date("2026-04-30"),
      isActive: true,
    },
    {
      title: "Tune Up Hemat",
      description:
        "Paket tune up lengkap dengan harga spesial. Termasuk busi, filter udara, dan pengecekan 20 titik.",
      discount: 15,
      validUntil: new Date("2026-05-15"),
      isActive: true,
    },
    {
      title: "Servis AC Premium",
      description:
        "Cuci AC + freon + pengecekan kompresor. Kendaraan Anda kembali segar dan nyaman.",
      discount: 25,
      validUntil: new Date("2026-06-20"),
      isActive: true,
    },
  ];

  for (const promo of promos) {
    await prisma.promo.create({ data: promo });
  }
  console.log(`✅ Created ${promos.length} promos`);

  // Create sample service record
  const oilItem = await prisma.inventory.findUnique({
    where: { itemCode: "OIL-001" },
  });
  const filterItem = await prisma.inventory.findUnique({
    where: { itemCode: "FLT-001" },
  });

  if (oilItem && filterItem) {
    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        vehicleId: vehicle.id,
        mechanicId: mechanic.id,
        date: new Date("2026-03-01"),
        mileage: 45000,
        description: "Ganti oli mesin + filter oli",
        totalCost: 4 * 120000 + 45000,
        status: "COMPLETED",
        notes: "Kondisi mesin baik, disarankan ganti filter udara di servis berikutnya.",
        serviceItems: {
          create: [
            {
              inventoryId: oilItem.id,
              quantity: 4,
              unitPrice: 120000,
            },
            {
              inventoryId: filterItem.id,
              quantity: 1,
              unitPrice: 45000,
            },
          ],
        },
      },
    });
    console.log("✅ Service record created:", serviceRecord.id);
  }

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Test accounts:");
  console.log("  Admin:    admin@autoflow.id / admin123456");
  console.log("  Mekanik:  mekanik@autoflow.id / mechanic123456");
  console.log("  Customer: pelanggan@autoflow.id / customer123456");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
