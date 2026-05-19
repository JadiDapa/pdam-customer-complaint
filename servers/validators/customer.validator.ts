import { Prisma } from "@/generated/prisma";
import { z } from "zod";

export type CustomerType = Prisma.CustomerGetPayload<{
  include: {
    user: true;
    complaints: {
      select: { id: true };
    };
  };
}>;

export const CustomerSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().min(1).max(50).optional(),
});

const CustomerBaseSchema = z.object({
  userId: z.number(),
  customerId: z.string().min(1),
  phoneNumber: z.string().min(1),
  address: z.string().min(1),
});

export const CreateCustomerSchema = CustomerBaseSchema.extend({});

export const UpdateCustomerSchema = CustomerBaseSchema.partial();

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
