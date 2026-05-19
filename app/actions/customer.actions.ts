"use server";

import { revalidatePath } from "next/cache";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
} from "@/servers/validators/customer.validator";
import { CustomerService } from "@/servers/services/customer.service";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export async function createCustomer(
  input: z.input<typeof CreateCustomerSchema>,
) {
  const data = CreateCustomerSchema.parse({
    userId: input.userId,
    customerId: input.customerId,
    phoneNumber: input.phoneNumber,
    address: input.address,
  });

  await CustomerService.create(data);

  revalidatePath("/dashboard/customers");
}

export async function updateCustomer(
  customerId: number,
  input: z.input<typeof UpdateCustomerSchema>,
) {
  const data = UpdateCustomerSchema.parse(input);

  await CustomerService.update(customerId, {
    ...data,
  });

  revalidatePath("/dashboard/customers");
}

export async function deleteCustomer(customerId: number) {
  await CustomerService.delete(customerId);

  revalidatePath("/dashboard/customers");
}

export type ImportRow = {
  fullname: string;
  username: string;
  password: string;
  customerId: string;
  phoneNumber: string;
  address: string;
};

export type ImportResult = {
  success: number;
  failed: { row: number; reason: string }[];
};

export async function importCustomers(rows: ImportRow[]): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: [] };
  const client = await clerkClient();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let clerkUserId: string | null = null;
    try {
      const { fullname, username, password, customerId, phoneNumber, address } = row;
      if (!fullname || !username || !password || !customerId || !phoneNumber || !address) {
        result.failed.push({ row: i + 2, reason: "Missing required fields" });
        continue;
      }

      if (password.length < 8) {
        result.failed.push({ row: i + 2, reason: "Password minimal 8 karakter" });
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        result.failed.push({ row: i + 2, reason: `Username "${username}" already exists` });
        continue;
      }

      const existingCustomer = await prisma.customer.findUnique({ where: { customerId } });
      if (existingCustomer) {
        result.failed.push({ row: i + 2, reason: `Customer ID "${customerId}" already exists` });
        continue;
      }

      const clerkUser = await client.users.createUser({
        username,
        firstName: fullname,
        password,
      });
      clerkUserId = clerkUser.id;

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { fullname, username, role: "CUSTOMER" },
        });
        await tx.customer.create({
          data: { userId: user.id, customerId, phoneNumber, address },
        });
      });

      result.success++;
    } catch (e) {
      if (clerkUserId) {
        await client.users.deleteUser(clerkUserId).catch(() => {});
      }
      let reason = e instanceof Error ? e.message : "Unknown error";
      if (e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: unknown[] }).errors)) {
        const clerkErrors = (e as { errors: { longMessage?: string; message?: string; code?: string }[] }).errors;
        const detail = clerkErrors.map((err) => err.longMessage || err.message || err.code).filter(Boolean).join("; ");
        if (detail) reason = detail;
      }
      console.error(`[importCustomers] Row ${i + 2} (${row.username}) failed:`, e);
      result.failed.push({ row: i + 2, reason });
    }
  }

  revalidatePath("/dashboard/customers");
  return result;
}
