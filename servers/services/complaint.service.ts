import { prisma } from "@/lib/prisma";
import { ComplaintStatus, DisturbanceType, Prisma } from "@/generated/prisma";
import type {
  CreateComplaintDTO,
  UpdateComplaintDTO,
} from "../validators/complaint.validator";
import { uploadToCloudinary } from "@/lib/cloudinary";

const complaintInclude = {
  customer: { include: { user: true } },
  technician: true,
  images: true,
} satisfies Prisma.ComplaintInclude;

export type ComplaintListOptions = {
  page?: number;
  pageSize?: number;
  title?: string;
  customerName?: string;
  disturbanceType?: DisturbanceType;
  status?: ComplaintStatus;
  technicianId?: number;
  customerId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  orderBy?: Prisma.ComplaintOrderByWithRelationInput;
};

function complaintWhere(
  opts: ComplaintListOptions,
): Prisma.ComplaintWhereInput {
  const and: Prisma.ComplaintWhereInput[] = [];

  if (opts.title)
    and.push({ title: { contains: opts.title, mode: "insensitive" } });
  if (opts.customerName)
    and.push({
      customer: {
        user: {
          fullname: { contains: opts.customerName, mode: "insensitive" },
        },
      },
    });
  if (opts.disturbanceType) and.push({ disturbanceType: opts.disturbanceType });
  if (opts.status) and.push({ status: opts.status });
  if (opts.technicianId) and.push({ technicianId: opts.technicianId });
  if (opts.customerId) and.push({ customerId: opts.customerId });
  if (opts.createdAfter) and.push({ createdAt: { gte: opts.createdAfter } });
  if (opts.createdBefore) and.push({ createdAt: { lt: opts.createdBefore } });

  return and.length ? { AND: and } : {};
}

export const ComplaintService = {
  async list(opts: ComplaintListOptions = {}) {
    const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 1), 100);
    const page = Math.max(opts.page ?? 1, 1);

    const where = complaintWhere(opts);
    const orderBy = opts.orderBy ?? { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: complaintInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.complaint.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  },

  async getRecent(count = 5) {
    return prisma.complaint.findMany({
      take: count,
      orderBy: { createdAt: "desc" },
      include: complaintInclude,
    });
  },

  async getAll() {
    return await prisma.complaint.findMany({
      include: complaintInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async getByCustomerId(customerId: number) {
    return await prisma.complaint.findMany({
      where: { customerId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        technician: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getByTechnicianId(technicianId: number) {
    return await prisma.complaint.findMany({
      where: { technicianId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        technician: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: number) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        technician: true,
        images: true,
      },
    });

    return complaint;
  },

  async hasActiveComplaint(customerId: number) {
    const count = await prisma.complaint.count({
      where: {
        customerId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    });
    return count > 0;
  },

  async create(data: CreateComplaintDTO, images: File[] = []) {
    if (data.customerId) {
      const active = await prisma.complaint.findFirst({
        where: {
          customerId: data.customerId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        select: { id: true },
      });
      if (active) {
        throw new Error("ACTIVE_COMPLAINT_EXISTS");
      }
    }

    const imageRecords: {
      url: string;
      filename: string;
      size: number;
      type: "COMPLAINT";
    }[] = [];

    for (const file of images) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { resource_type: "image" });
      imageRecords.push({
        url: result.secure_url,
        filename: result.public_id,
        size: file.size,
        type: "COMPLAINT",
      });
    }

    const complaint = await prisma.complaint.create({
      data: {
        ...data,
        images: {
          createMany: {
            data: imageRecords,
          },
        },
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        technician: true,
        images: true,
      },
    });

    return complaint;
  },

  async assign(id: number, technicianId: number) {
    return prisma.complaint.update({
      where: { id },
      data: { technicianId },
    });
  },

  async schedule(id: number, data: { scheduledAt: Date }) {
    return prisma.complaint.update({
      where: { id },
      data: { scheduledAt: data.scheduledAt, status: "IN_PROGRESS" },
    });
  },

  async submitEvidence(id: number, images: File[]) {
    const imageRecords: {
      url: string;
      filename: string;
      size: number;
      type: "EVIDENCE";
    }[] = [];

    for (const file of images) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { resource_type: "image" });
      imageRecords.push({
        url: result.secure_url,
        filename: result.public_id,
        size: file.size,
        type: "EVIDENCE",
      });
    }

    return prisma.complaint.update({
      where: { id },
      data: {
        status: "RESOLVED",
        images: { createMany: { data: imageRecords } },
      },
    });
  },

  async cancel(id: number) {
    return prisma.complaint.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  },

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, pending, inProgress, resolved, cancelled, todayCount] =
      await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: "PENDING" } }),
        prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
        prisma.complaint.count({ where: { status: "RESOLVED" } }),
        prisma.complaint.count({ where: { status: "CANCELLED" } }),
        prisma.complaint.count({
          where: { createdAt: { gte: today, lt: tomorrow } },
        }),
      ]);

    return { total, pending, inProgress, resolved, cancelled, todayCount };
  },

  async getDailyStats(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const complaints = await prisma.complaint.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
    });

    const map: Record<
      string,
      { pending: number; inProgress: number; resolved: number }
    > = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { pending: 0, inProgress: 0, resolved: 0 };
    }

    for (const c of complaints) {
      const key = new Date(c.createdAt).toISOString().slice(0, 10);
      if (!map[key]) continue;
      if (c.status === "PENDING") map[key].pending++;
      else if (c.status === "IN_PROGRESS") map[key].inProgress++;
      else if (c.status === "RESOLVED") map[key].resolved++;
    }

    return Object.entries(map).map(([date, counts]) => ({ date, ...counts }));
  },

  exportInvoice(_id: number) {
    return { message: "Not implemented" };
  },

  async update(id: number, data: UpdateComplaintDTO) {
    return prisma.complaint.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.complaint.delete({ where: { id } });
  },
};
