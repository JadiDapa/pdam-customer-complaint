import { ComplaintStatus, DisturbanceType, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
const hoursAgo = (n: number) => new Date(Date.now() - n * 36e5);
const hoursFromNow = (n: number) => new Date(Date.now() + n * 36e5);

async function main() {
  console.log("Resetting database...");

  await prisma.image.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding admin...");

  await prisma.user.create({
    data: { fullname: "Admin PDAM", username: "admin", role: UserRole.ADMIN },
  });

  console.log("Seeding technicians...");

  // Create User records first, then Technician records linked to them
  const [tech1, tech2] = await Promise.all([
    prisma.user
      .create({
        data: {
          fullname: "Joko Widodo",
          username: "joko.widodo",
          role: UserRole.TECHNICIAN,
        },
      })
      .then((u) =>
        prisma.technician.create({
          data: {
            fullname: u.fullname,
            region: "Jakarta Utara",
            userId: u.id,
          },
        }),
      ),
    prisma.user
      .create({
        data: {
          fullname: "Bambang Susilo",
          username: "bambang.susilo",
          role: UserRole.TECHNICIAN,
        },
      })
      .then((u) =>
        prisma.technician.create({
          data: {
            fullname: u.fullname,
            region: "Jakarta Selatan",
            userId: u.id,
          },
        }),
      ),
  ]);

  console.log("Seeding customers & complaints...");

  // username = login username, customerId = password
  const customerUsers = await prisma.user.createManyAndReturn({
    data: [
      {
        fullname: "Budi Santoso",
        username: "budi.santoso",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Siti Rahayu",
        username: "siti.rahayu",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Ahmad Fauzi",
        username: "ahmad.fauzi",
        role: UserRole.CUSTOMER,
      },
    ],
  });

  // Customer 1 — Budi Santoso — active: PENDING
  const c1 = await prisma.customer.create({
    data: {
      userId: customerUsers[0].id,
      customerId: "PDAM00001",
      address: "Jl. Mangga No. 12, Jakarta Utara",
    },
  });
  await prisma.complaint.createMany({
    data: [
      {
        customerId: c1.id,
        title: "Air tidak mengalir sejak pagi",
        description:
          "Tidak ada aliran air sama sekali dari keran sejak pukul 06.00.",
        disturbanceType: DisturbanceType.AIR_TIDAK_MENGALIR,
        status: ComplaintStatus.PENDING,
        createdAt: hoursAgo(2),
      },
      {
        customerId: c1.id,
        technicianId: tech1.id,
        title: "Kebocoran pipa dapur",
        disturbanceType: DisturbanceType.KEBOCORAN_PIPA,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(15),
        createdAt: daysAgo(16),
      },
      {
        customerId: c1.id,
        title: "Air keruh berwarna coklat",
        disturbanceType: DisturbanceType.AIR_KERUH,
        status: ComplaintStatus.CANCELLED,
        createdAt: daysAgo(30),
      },
    ],
  });

  // Customer 2 — Siti Rahayu — active: IN_PROGRESS
  const c2 = await prisma.customer.create({
    data: {
      userId: customerUsers[1].id,
      customerId: "PDAM00002",
      address: "Jl. Kenanga No. 5, Jakarta Selatan",
    },
  });
  await prisma.complaint.createMany({
    data: [
      {
        customerId: c2.id,
        technicianId: tech2.id,
        title: "Tekanan air sangat lemah di lantai 2",
        description:
          "Tekanan turun drastis, hampir tidak ada aliran di kamar mandi atas.",
        disturbanceType: DisturbanceType.TEKANAN_RENDAH,
        status: ComplaintStatus.IN_PROGRESS,
        scheduledAt: hoursFromNow(3),
        createdAt: hoursAgo(5),
      },
      {
        customerId: c2.id,
        technicianId: tech1.id,
        title: "Meter air tidak berputar",
        disturbanceType: DisturbanceType.METER_RUSAK,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(10),
        createdAt: daysAgo(12),
      },
      {
        customerId: c2.id,
        technicianId: tech2.id,
        title: "Pipa bocor di halaman depan",
        disturbanceType: DisturbanceType.KEBOCORAN_PIPA,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(22),
        createdAt: daysAgo(25),
      },
    ],
  });

  // Customer 3 — Ahmad Fauzi — active: PENDING
  const c3 = await prisma.customer.create({
    data: {
      userId: customerUsers[2].id,
      customerId: "PDAM00003",
      address: "Jl. Melati Blok C No. 8, Depok",
    },
  });
  await prisma.complaint.createMany({
    data: [
      {
        customerId: c3.id,
        title: "Pipa utama pecah dekat gerbang",
        description: "Ada retakan besar di pipa utama, air menyembur keluar.",
        disturbanceType: DisturbanceType.PIPA_PECAH,
        status: ComplaintStatus.PENDING,
        createdAt: hoursAgo(1),
      },
      {
        customerId: c3.id,
        technicianId: tech1.id,
        title: "Air tidak mengalir 2 hari",
        disturbanceType: DisturbanceType.AIR_TIDAK_MENGALIR,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(8),
        createdAt: daysAgo(9),
      },
    ],
  });

  const totalComplaints = await prisma.complaint.count();
  const totalCustomers = await prisma.customer.count();
  const totalUsers = await prisma.user.count();
  const totalTechnicians = await prisma.technician.count();

  console.log(
    `Seeding finished. ${totalUsers} users · ${totalCustomers} customers · ${totalTechnicians} technicians · ${totalComplaints} complaints`,
  );
  console.log("\nSeed credentials (username / password):");
  console.log("  admin          / (set in Clerk)");
  console.log("  joko.widodo    / (set in Clerk)");
  console.log("  bambang.susilo / (set in Clerk)");
  console.log("  budi.santoso   / PDAM00001");
  console.log("  siti.rahayu    / PDAM00002");
  console.log("  ahmad.fauzi    / PDAM00003");
  console.log("  dewi.lestari   / PDAM00004");
  console.log("  rudi.hartono   / PDAM00005");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
