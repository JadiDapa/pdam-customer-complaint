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

export const CreateCustomerSchema = z.object({
  fullname: z.string().min(1),
  username: z.string().min(1),
  customerId: z.string().min(1),
  phoneNumber: z.string().optional(),
  address: z.string().min(1),
});

export const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
});

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
