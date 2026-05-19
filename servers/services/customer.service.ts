import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "../validators/customer.validator";

export type CustomerListOptions = {
  page?: number;
  pageSize?: number;
  userId?: number;
  customerId?: string;
  phoneNumber?: string;
  address?: string;
  orderBy?: Prisma.CustomerOrderByWithRelationInput;
};

function customerWhere(opts: CustomerListOptions): Prisma.CustomerWhereInput {
  const and: Prisma.CustomerWhereInput[] = [];

  if (opts.userId) and.push({ userId: opts.userId });
  if (opts.customerId) and.push({ customerId: opts.customerId });
  if (opts.phoneNumber) and.push({ phoneNumber: opts.phoneNumber });
  if (opts.address) and.push({ address: opts.address });

  return and.length ? { AND: and } : {};
}

export const CustomerService = {
  async list(opts: CustomerListOptions = {}) {
    const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 1), 100);
    const page = Math.max(opts.page ?? 1, 1);

    const where = customerWhere(opts);
    const orderBy = opts.orderBy ?? { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  },

  async getAll() {
    return await prisma.customer.findMany({
      include: {
        user: true,
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
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        complaints: {
          include: { technician: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async getByUserId(userId: number) {
    return await prisma.customer.findUnique({
      where: { userId },
    });
  },

  async create(data: CreateCustomerDTO) {
    return prisma.customer.create({ data });
  },

  async update(id: number, data: UpdateCustomerDTO) {
    return prisma.customer.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.customer.delete({ where: { id } });
  },
};
