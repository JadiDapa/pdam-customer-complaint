import { ComplaintStatus, DisturbanceType, Prisma } from "@/generated/prisma";
import { z } from "zod";

export type ComplaintType = Prisma.ComplaintGetPayload<{
  include: {
    customer: {
      include: {
        user: true;
      };
    };
    technician: true;
    images: true;
  };
}>;

export const ComplaintSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().min(1).max(50).optional(),
});

const ComplaintBaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  disturbanceType: z.nativeEnum(DisturbanceType),
  customerId: z.number().int().optional(),
  technicianId: z.number().int().optional(),
  scheduledAt: z.date().optional(),
});

export const CreateComplaintSchema = ComplaintBaseSchema.extend({});

export const UpdateComplaintSchema = ComplaintBaseSchema.partial();

export type CreateComplaintDTO = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintDTO = z.infer<typeof UpdateComplaintSchema>;
