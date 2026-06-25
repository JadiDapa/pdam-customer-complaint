import { Prisma } from "@/generated/prisma";
import { z } from "zod";

export type TechnicianType = Prisma.TechnicianGetPayload<{
  include: {
    complaints: { select: { id: true } };
  };
}>;

export const TechnicianSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().min(1).max(50).optional(),
});

const TechnicianBaseSchema = z.object({
  fullname: z.string().min(1),
  region: z.string().min(1),
});

export const CreateTechnicianSchema = TechnicianBaseSchema.extend({
  userId: z.number().optional(),
});

export const CreateTechnicianAccountSchema = TechnicianBaseSchema.extend({
  username: z.string().min(1),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const UpdateTechnicianSchema = TechnicianBaseSchema.partial();

export type CreateTechnicianDTO = z.infer<typeof CreateTechnicianSchema>;
export type CreateTechnicianAccountDTO = z.infer<typeof CreateTechnicianAccountSchema>;
export type UpdateTechnicianDTO = z.infer<typeof UpdateTechnicianSchema>;
