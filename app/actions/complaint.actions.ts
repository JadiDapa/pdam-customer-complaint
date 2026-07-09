"use server";

import { revalidatePath } from "next/cache";
import { UpdateComplaintSchema } from "@/servers/validators/complaint.validator";
import { ComplaintService } from "@/servers/services/complaint.service";
import { TechnicianService } from "@/servers/services/technician.service";
import { getCurrentUser } from "@/app/actions/user.actions";
import z from "zod";
import { CreateComplaintSchema } from "@/servers/validators/complaint.validator";

/** Throws unless the logged-in user is an ADMIN. */
async function assertAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Throws unless the logged-in user is the field officer (technician) the
 * complaint is assigned to. Returns the complaint on success.
 */
async function assertAssignedTechnician(complaintId: number) {
  const user = await getCurrentUser();
  if (user.role !== "TECHNICIAN") {
    throw new Error("FORBIDDEN");
  }
  const technician = await TechnicianService.getByUserId(user.id);
  const complaint = await ComplaintService.getById(complaintId);
  if (!technician || !complaint || complaint.technicianId !== technician.id) {
    throw new Error("FORBIDDEN");
  }
  return complaint;
}

export async function createComplaint(
  formData: FormData,
): Promise<{ error?: string }> {
  const rawCustomerId = formData.get("customerId");
  const rawTechnicianId = formData.get("technicianId");

  const data = CreateComplaintSchema.parse({
    customerId: rawCustomerId ? Number(rawCustomerId) : undefined,
    technicianId: rawTechnicianId ? Number(rawTechnicianId) : undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    disturbanceType: formData.get("disturbanceType"),
  });

  const images = formData
    .getAll("images")
    .filter((f) => f instanceof File && f.size > 0) as File[];

  try {
    await ComplaintService.create(data, images);
  } catch (e) {
    if (e instanceof Error && e.message === "ACTIVE_COMPLAINT_EXISTS") {
      return { error: "Kamu masih memiliki keluhan yang aktif. Selesaikan keluhan tersebut terlebih dahulu." };
    }
    throw e;
  }

  revalidatePath("/dashboard/complaints");
  revalidatePath("/");
  return {};
}

export async function updateComplaint(
  complaintId: number,
  input: z.input<typeof UpdateComplaintSchema>,
) {
  const data = UpdateComplaintSchema.parse(input);

  await ComplaintService.update(complaintId, data);

  revalidatePath("/dashboard/complaints/" + complaintId);
  revalidatePath("/dashboard/complaints");
}

// ADMIN routes a complaint to a field officer; status stays PENDING until the
// officer schedules it.
export async function assignTechnician(
  complaintId: number,
  technicianId: number,
) {
  await assertAdmin();

  await ComplaintService.assign(complaintId, technicianId);

  revalidatePath("/dashboard/complaints/" + complaintId);
  revalidatePath("/dashboard/complaints");
}

// The assigned field officer sets the execution date, moving it to IN_PROGRESS.
export async function scheduleComplaint(
  complaintId: number,
  input: { scheduledAt: Date },
) {
  await assertAssignedTechnician(complaintId);

  await ComplaintService.schedule(complaintId, input);

  revalidatePath("/dashboard/complaints/" + complaintId);
  revalidatePath("/dashboard/complaints");
}

export async function submitEvidence(complaintId: number, formData: FormData) {
  await assertAssignedTechnician(complaintId);

  const files = formData
    .getAll("files")
    .filter((f) => f instanceof File && f.size > 0) as File[];

  await ComplaintService.submitEvidence(complaintId, files);

  revalidatePath("/dashboard/complaints/" + complaintId);
  revalidatePath("/dashboard/complaints");
}

export async function cancelComplaint(complaintId: number) {
  await ComplaintService.cancel(complaintId);

  revalidatePath("/complaints/" + complaintId);
  revalidatePath("/");
}

export async function deleteComplaint(complaintId: number) {
  await assertAdmin();

  await ComplaintService.delete(complaintId);

  revalidatePath("/dashboard/complaints");
}
