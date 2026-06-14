"use server";

import { revalidatePath } from "next/cache";
import {
  CreateCustomerSchema,
  SignUpCustomerSchema,
  UpdateCustomerSchema,
} from "@/servers/validators/customer.validator";
import { CustomerService } from "@/servers/services/customer.service";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { clerkClient } from "@clerk/nextjs/server";

export async function createCustomer(
  input: z.input<typeof CreateCustomerSchema>,
) {
  const { fullname, username, customerId, phoneNumber, address } =
    CreateCustomerSchema.parse(input);

  const client = await clerkClient();
  let clerkUserId: string | null = null;

  try {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) throw new Error("Username sudah terdaftar");

    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });
    if (existingCustomer) throw new Error("ID Pelanggan sudah terdaftar");

    const clerkUser = await client.users.createUser({
      username,
      firstName: fullname,
      password: customerId,
    });
    clerkUserId = clerkUser.id;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { fullname, username, role: "CUSTOMER" },
      });
      await tx.customer.create({
        data: {
          userId: user.id,
          customerId,
          phoneNumber: phoneNumber || null,
          address,
        },
      });
    });
  } catch (e) {
    if (clerkUserId) {
      await client.users.deleteUser(clerkUserId).catch(() => {});
    }
    throw e;
  }

  revalidatePath("/dashboard/customers");
}

export async function signUpCustomer(
  input: z.input<typeof SignUpCustomerSchema>,
) {
  const { fullname, username, customerId, phoneNumber, address, password } =
    SignUpCustomerSchema.parse(input);

  const client = await clerkClient();
  let clerkUserId: string | null = null;

  try {
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) throw new Error("Username sudah terdaftar");

    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });
    if (existingCustomer) throw new Error("ID Pelanggan sudah terdaftar");

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
        data: {
          userId: user.id,
          customerId,
          phoneNumber: phoneNumber || null,
          address,
        },
      });
    });
  } catch (e) {
    if (clerkUserId) {
      await client.users.deleteUser(clerkUserId).catch(() => {});
    }
    throw e;
  }

  revalidatePath("/dashboard/customers");
}

export async function updateCustomer(
  customerId: number,
  input: z.input<typeof UpdateCustomerSchema>,
) {
  const data = UpdateCustomerSchema.parse(input);
  await CustomerService.update(customerId, data);
  revalidatePath("/dashboard/customers");
}

export async function deleteCustomer(customerId: number) {
  await CustomerService.delete(customerId);
  revalidatePath("/dashboard/customers");
}

export type ImportRow = {
  fullname: string;
  username: string;
  customerId: string;
  phoneNumber?: string;
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
      const { fullname, username, customerId, phoneNumber, address } = row;
      if (!fullname || !username || !customerId || !address) {
        result.failed.push({ row: i + 2, reason: "Missing required fields" });
        continue;
      }

      if (customerId.length < 8) {
        result.failed.push({
          row: i + 2,
          reason: "ID Pelanggan minimal 8 karakter",
        });
        continue;
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        result.failed.push({
          row: i + 2,
          reason: `Username "${username}" sudah terdaftar`,
        });
        continue;
      }

      const existingCustomer = await prisma.customer.findUnique({
        where: { customerId },
      });
      if (existingCustomer) {
        result.failed.push({
          row: i + 2,
          reason: `ID Pelanggan "${customerId}" sudah terdaftar`,
        });
        continue;
      }

      const clerkUser = await client.users.createUser({
        username,
        firstName: fullname,
        password: customerId,
      });
      clerkUserId = clerkUser.id;

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { fullname, username, role: "CUSTOMER" },
        });
        await tx.customer.create({
          data: {
            userId: user.id,
            customerId,
            phoneNumber: phoneNumber || null,
            address,
          },
        });
      });

      result.success++;
    } catch (e) {
      if (clerkUserId) {
        await client.users.deleteUser(clerkUserId).catch(() => {});
      }
      let reason = e instanceof Error ? e.message : "Unknown error";
      if (
        e &&
        typeof e === "object" &&
        "errors" in e &&
        Array.isArray((e as { errors: unknown[] }).errors)
      ) {
        const clerkErrors = (
          e as {
            errors: { longMessage?: string; message?: string; code?: string }[];
          }
        ).errors;
        const detail = clerkErrors
          .map((err) => err.longMessage || err.message || err.code)
          .filter(Boolean)
          .join("; ");
        if (detail) reason = detail;
      }
      console.error(`[importCustomers] Row ${i + 2} failed:`, e);
      result.failed.push({ row: i + 2, reason });
    }
  }

  revalidatePath("/dashboard/customers");
  return result;
}
