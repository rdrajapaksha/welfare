import "server-only";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { readSession, type SessionPayload } from "./session";
import type { Locale } from "@/i18n/config";

export type AuthUser = SessionPayload;

export async function getCurrentUser(): Promise<AuthUser | null> {
  return readSession();
}

export async function requireUser(locale: Locale, returnTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/${locale}/login${target}`);
  }
  return user;
}

export async function requireAdmin(locale: Locale, returnTo?: string): Promise<AuthUser> {
  const user = await requireUser(locale, returnTo);
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    redirect(`/${locale}/dashboard`);
  }
  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { member: { select: { id: true } } },
  });
  if (!user) return { ok: false as const, reason: "INVALID" as const };

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return { ok: false as const, reason: "INVALID" as const };
  if (!user.isActive) return { ok: false as const, reason: "INACTIVE" as const };

  return {
    ok: true as const,
    session: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionPayload["role"],
      memberId: user.member?.id ?? null,
    } satisfies SessionPayload,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
