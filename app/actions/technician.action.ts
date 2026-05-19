"use server";

import { revalidatePath } from "next/cache";
import {
  CreateTechnicianSchema,
  UpdateTechnicianSchema,
} from "@/servers/validators/technician.validator";
import { TechnicianService } from "@/servers/services/technician.service";
import z from "zod";

export async function createTechnician(
  input: z.input<typeof CreateTechnicianSchema>,
) {
  const data = CreateTechnicianSchema.parse({
    fullname: input.fullname,
    phoneNumber: input.phoneNumber,
    region: input.region,
  });

  await TechnicianService.create(data);

  revalidatePath("/dashboard/technicians");
}

export async function updateTechnician(
  technicianId: number,
  input: z.input<typeof UpdateTechnicianSchema>,
) {
  const data = UpdateTechnicianSchema.parse(input);

  await TechnicianService.update(technicianId, data);

  revalidatePath("/dashboard/technicians");
}

export async function deleteTechnician(technicianId: number) {
  await TechnicianService.delete(technicianId);

  revalidatePath("/dashboard/technicians");
}
