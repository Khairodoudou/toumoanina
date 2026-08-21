import { cookies } from "next/headers";
import { db, User } from "./db";
import { tursoFindUserById } from "./turso-queries";

const SESSION_COOKIE_NAME = "toumoanina_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "family" | "admin";
  name: string;
}

export async function createSessionCookie(user: User): Promise<string> {
  const token = Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: Date.now(),
    })
  ).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return token;
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    ) as SessionPayload;

    // 1. Try Turso (persistent - real accounts on Vercel)
    const tursoUser = await tursoFindUserById(payload.userId);
    if (tursoUser) return tursoUser;

    // 2. Fallback to in-memory (demo accounts + local dev)
    const memUser = db.users.find((u) => u.id === payload.userId);
    return memUser || null;
  } catch {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function requireAuth(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  return user;
}
