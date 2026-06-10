"use server";

import { revalidatePath } from "next/cache";
import {
  CreateTechnicianAccountSchema,
  UpdateTechnicianSchema,
} from "@/servers/validators/technician.validator";
import { TechnicianService } from "@/servers/services/technician.service";
import { UserService } from "@/servers/services/user.service";
import z from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export async function createTechnician(
  input: z.input<typeof CreateTechnicianAccountSchema>,
) {
  const data = CreateTechnicianAccountSchema.parse(input);

  const client = await clerkClient();
  let clerkUserId: string | null = null;
  let dbUserId: number | null = null;

  try {
    const clerkUser = await client.users.createUser({
      username: data.username,
      firstName: data.fullname,
      password: data.password,
    });
    clerkUserId = clerkUser.id;

    const user = await UserService.create({
      username: data.username,
      fullname: data.fullname,
      role: "TECHNICIAN",
      password: data.password,
    });
    dbUserId = user.id;

    await TechnicianService.create({
      fullname: data.fullname,
      phoneNumber: data.phoneNumber,
      region: data.region,
      userId: user.id,
    });
  } catch (e) {
    if (dbUserId) await UserService.delete(dbUserId).catch(() => {});
    if (clerkUserId) await client.users.deleteUser(clerkUserId).catch(() => {});

    let message = e instanceof Error ? e.message : "Unknown error";
    if (e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: unknown[] }).errors)) {
      const clerkErrors = (e as { errors: { longMessage?: string; message?: string; code?: string }[] }).errors;
      const detail = clerkErrors.map((err) => err.longMessage || err.message || err.code).filter(Boolean).join("; ");
      if (detail) message = detail;
    }
    throw new Error(message);
  }

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
