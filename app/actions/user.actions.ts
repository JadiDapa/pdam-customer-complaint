"use server";

import { revalidatePath } from "next/cache";
import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/servers/validators/user.validator";
import { UserService } from "@/servers/services/user.service";
import z from "zod";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser?.username) {
    redirect("/sign-in");
  }

  const user = await UserService.getByUsername(clerkUser.username);

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function createUser(input: z.input<typeof CreateUserSchema>) {
  const data = CreateUserSchema.parse(input);

  const client = await clerkClient();
  let clerkUserId: string | null = null;
  try {
    const clerkUser = await client.users.createUser({
      username: data.username,
      firstName: data.fullname,
      password: data.password,
    });
    clerkUserId = clerkUser.id;

    await UserService.create(data);
  } catch (e) {
    if (clerkUserId) {
      await client.users.deleteUser(clerkUserId).catch(() => {});
    }
    let message = e instanceof Error ? e.message : "Unknown error";
    if (e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: unknown[] }).errors)) {
      const clerkErrors = (e as { errors: { longMessage?: string; message?: string; code?: string }[] }).errors;
      const detail = clerkErrors.map((err) => err.longMessage || err.message || err.code).filter(Boolean).join("; ");
      if (detail) message = detail;
    }
    throw new Error(message);
  }

  revalidatePath("/dashboard/users");
}

export async function updateUser(
  userId: number,
  input: z.input<typeof UpdateUserSchema>,
) {
  const data = UpdateUserSchema.parse(input);

  await UserService.update(userId, {
    ...data,
  });

  revalidatePath("/dashboard/users");
}
