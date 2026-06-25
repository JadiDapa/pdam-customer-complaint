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
  address: z.string().min(1),
});

export const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
});

export const SignUpCustomerSchema = z
  .object({
    fullname: z.string().min(1, "Nama lengkap tidak boleh kosong"),
    customerId: z.string().min(8, "ID Pelanggan minimal 8 karakter"),
    address: z.string().min(1, "Alamat tidak boleh kosong"),
    username: z.string().min(4, "Username minimal 4 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type SignUpCustomerDTO = z.infer<typeof SignUpCustomerSchema>;

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
