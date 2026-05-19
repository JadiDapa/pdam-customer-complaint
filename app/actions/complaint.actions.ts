"use server";

import { revalidatePath } from "next/cache";
import { UpdateComplaintSchema } from "@/servers/validators/complaint.validator";
import { ComplaintService } from "@/servers/services/complaint.service";
import z from "zod";
import { CreateComplaintSchema } from "@/servers/validators/complaint.validator";

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

export async function scheduleComplaint(
  complaintId: number,
  input: { technicianId: number; scheduledAt: Date },
) {
  await ComplaintService.schedule(complaintId, input);

  revalidatePath("/dashboard/complaints/" + complaintId);
  revalidatePath("/dashboard/complaints");
}

export async function submitEvidence(complaintId: number, formData: FormData) {
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
  await ComplaintService.delete(complaintId);

  revalidatePath("/dashboard/complaints");
}
