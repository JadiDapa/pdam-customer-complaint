import { ComplaintStatus, DisturbanceType, UserRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
const hoursAgo = (n: number) => new Date(Date.now() - n * 36e5);
const hoursFromNow = (n: number) => new Date(Date.now() + n * 36e5);

async function main() {
  console.log("Resetting database...");

  // Delete in FK-safe order
  await prisma.image.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");

  // ── Staff ──────────────────────────────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      { fullname: "Admin PDAM", username: "admin", role: UserRole.ADMIN },
      { fullname: "Kepala Teknik", username: "lead", role: UserRole.LEAD },
    ],
  });

  // ── Customers ─────────────────────────────────────────────────────────────
  const customerUsers = await prisma.user.createManyAndReturn({
    data: [
      {
        fullname: "Budi Santoso",
        username: "budisantoso",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Siti Rahayu",
        username: "sitirahayu",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Ahmad Fauzi",
        username: "ahmadfauzi",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Dewi Lestari",
        username: "dewilestari",
        role: UserRole.CUSTOMER,
      },
      {
        fullname: "Rudi Hartono",
        username: "rudihartono",
        role: UserRole.CUSTOMER,
      },
    ],
  });

  console.log("Seeding technicians...");

  // ── Technicians ───────────────────────────────────────────────────────────
  const [tech1, tech2] = await Promise.all([
    prisma.technician.create({
      data: {
        fullname: "Joko Widodo",
        phoneNumber: "081211112222",
        region: "Jakarta Utara",
      },
    }),
    prisma.technician.create({
      data: {
        fullname: "Bambang Susilo",
        phoneNumber: "081233334444",
        region: "Jakarta Selatan",
      },
    }),
  ]);

  console.log("Seeding customers & complaints...");

  // ── Customer profiles + complaints ────────────────────────────────────────
  // Each customer: 1 active complaint (PENDING or IN_PROGRESS) + resolved/cancelled history

  // Customer 1 — Budi Santoso — active: PENDING
  const c1 = await prisma.customer.create({
    data: {
      userId: customerUsers[0].id,
      customerId: "PDAM-001",
      phoneNumber: "081311112222",
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
      // History
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
      customerId: "PDAM-002",
      phoneNumber: "081322223333",
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
      // History
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
      customerId: "PDAM-003",
      phoneNumber: "081333334444",
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
      // History
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

  // Customer 4 — Dewi Lestari — active: IN_PROGRESS
  const c4 = await prisma.customer.create({
    data: {
      userId: customerUsers[3].id,
      customerId: "PDAM-004",
      phoneNumber: "081344445555",
      address: "Jl. Bougenville No. 21, Bekasi",
    },
  });
  await prisma.complaint.createMany({
    data: [
      {
        customerId: c4.id,
        technicianId: tech1.id,
        title: "Gangguan lainnya pada instalasi",
        description: "Ada suara aneh dari pipa dalam dinding.",
        disturbanceType: DisturbanceType.LAINNYA,
        status: ComplaintStatus.IN_PROGRESS,
        scheduledAt: hoursFromNow(1),
        createdAt: hoursAgo(8),
      },
      // History
      {
        customerId: c4.id,
        technicianId: tech2.id,
        title: "Air keruh setelah hujan lebat",
        disturbanceType: DisturbanceType.AIR_KERUH,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(5),
        createdAt: daysAgo(7),
      },
      {
        customerId: c4.id,
        title: "Tekanan rendah pagi hari",
        disturbanceType: DisturbanceType.TEKANAN_RENDAH,
        status: ComplaintStatus.CANCELLED,
        createdAt: daysAgo(20),
      },
    ],
  });

  // Customer 5 — Rudi Hartono — active: PENDING
  const c5 = await prisma.customer.create({
    data: {
      userId: customerUsers[4].id,
      customerId: "PDAM-005",
      phoneNumber: "081355556666",
      address: "Perumahan Griya Asri No. 3, Tangerang",
    },
  });
  await prisma.complaint.createMany({
    data: [
      {
        customerId: c5.id,
        title: "Meter rusak, angka tidak berubah",
        description: "Sudah digunakan air banyak tapi meteran tidak bergerak.",
        disturbanceType: DisturbanceType.METER_RUSAK,
        status: ComplaintStatus.PENDING,
        createdAt: hoursAgo(4),
      },
      // History
      {
        customerId: c5.id,
        technicianId: tech2.id,
        title: "Kebocoran kecil di bawah wastafel",
        disturbanceType: DisturbanceType.KEBOCORAN_PIPA,
        status: ComplaintStatus.RESOLVED,
        scheduledAt: daysAgo(18),
        createdAt: daysAgo(19),
      },
    ],
  });

  const totalComplaints = await prisma.complaint.count();
  const totalCustomers = await prisma.customer.count();
  const totalUsers = await prisma.user.count();

  console.log(
    `Seeding finished. ${totalUsers} users · ${totalCustomers} customers · ${totalComplaints} complaints`,
  );
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
