import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type {
  CreateTechnicianDTO,
  UpdateTechnicianDTO,
} from "../validators/technician.validator";

export type TechnicianListOptions = {
  page?: number;
  pageSize?: number;
  fullname?: string;
  region?: string;
  orderBy?: Prisma.TechnicianOrderByWithRelationInput;
};

function technicianWhere(
  opts: TechnicianListOptions,
): Prisma.TechnicianWhereInput {
  const and: Prisma.TechnicianWhereInput[] = [];

  if (opts.fullname) and.push({ fullname: opts.fullname });
  if (opts.region) and.push({ region: opts.region });

  return and.length ? { AND: and } : {};
}

export const TechnicianService = {
  async list(opts: TechnicianListOptions = {}) {
    const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 1), 100);
    const page = Math.max(opts.page ?? 1, 1);

    const where = technicianWhere(opts);
    const orderBy = opts.orderBy ?? { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.technician.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.technician.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  },

  async getAll() {
    return await prisma.technician.findMany({
      include: {
        complaints: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          select: { id: true },
        },
      },
    });
  },

  async getById(id: number) {
    return await prisma.technician.findUnique({
      where: { id },
      include: {
        complaints: {
          include: {
            customer: { include: { user: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async getByUserId(userId: number) {
    return await prisma.technician.findUnique({
      where: { userId },
    });
  },

  async create(data: CreateTechnicianDTO) {
    return prisma.technician.create({ data });
  },

  async update(id: number, data: UpdateTechnicianDTO) {
    return prisma.technician.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.technician.delete({ where: { id } });
  },
};
