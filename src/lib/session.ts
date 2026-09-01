import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hla_session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "MEMBER" | "ADMIN" | "EDITOR";
  memberId: string | null;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export async function encodeSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("heart-link-allianz")
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function decodeSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: "heart-link-allianz",
    });
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    return {
      userId: payload.userId,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role as SessionPayload["role"],
      memberId: typeof payload.memberId === "string" ? payload.memberId : null,
    };
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await encodeSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}
