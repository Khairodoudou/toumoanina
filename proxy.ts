import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionPayload {
  userId: string;
  email: string;
  role: "family" | "admin";
  name: string;
  createdAt: number;
}

function parseSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  try {
    const raw = Buffer.from(cookieValue, "base64").toString("utf-8");
    const payload = JSON.parse(raw);
    if (payload && typeof payload.userId === "string" && typeof payload.role === "string") {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("toumoanina_session");
  const session = parseSession(sessionCookie?.value);

  // 1. Admin route protection: /admin and /admin/*
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Family route protection: /family and /family/*
  if (pathname === "/family" || pathname.startsWith("/family/")) {
    if (!session || !session.userId) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Patient route protection: /patient and /patient/*
  if (pathname === "/patient" || pathname.startsWith("/patient/")) {
    if (!session || !session.userId) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Auth pages redirect if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (session && session.userId) {
      if (session.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/family/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/family",
    "/family/:path*",
    "/patient",
    "/patient/:path*",
    "/login",
    "/register",
  ],
};
