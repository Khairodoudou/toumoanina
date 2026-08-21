import { NextResponse } from "next/server";
import { db, verifyPassword, hashPassword, User } from "@/lib/server/db";
import { createSessionCookie, sanitizeUser } from "@/lib/server/auth";
import { tursoFindUserByEmail, tursoInsertLog } from "@/lib/server/turso-queries";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Demo/admin hardcoded shortcuts ────────────────────────────────────
    if (normalizedEmail === "admin@gmail.com" && password === "123456789") {
      const adminUser: User = {
        id: "usr_admin_demo",
        name: "Administrateur ToumAnina",
        email: "admin@gmail.com",
        phone: "+213 550 00 00 00",
        role: "admin",
        passwordHash: hashPassword("123456789"),
        createdAt: new Date().toISOString(),
      };
      const token = await createSessionCookie(adminUser);
      await tursoInsertLog({
        id: `log_${Date.now()}`,
        userId: adminUser.id,
        userEmail: adminUser.email,
        action: "AUTH_LOGIN",
        details: "Connexion réussie (admin)",
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        user: sanitizeUser(adminUser),
        token,
        redirectUrl: "/admin/dashboard",
      });
    }

    if (normalizedEmail === "famille.demo@toumoanina.app" && password === "Famille123!") {
      const demoFamily: User = {
        id: "usr_family_demo",
        name: "Famille Benali",
        email: "famille.demo@toumoanina.app",
        phone: "+213 549 18 19 11",
        role: "family",
        patientExitPin: "1234",
        passwordHash: hashPassword("Famille123!"),
        createdAt: new Date().toISOString(),
      };
      const token = await createSessionCookie(demoFamily);
      await tursoInsertLog({
        id: `log_${Date.now()}`,
        userId: demoFamily.id,
        userEmail: demoFamily.email,
        action: "AUTH_LOGIN",
        details: "Connexion réussie (famille démo)",
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        user: sanitizeUser(demoFamily),
        token,
        redirectUrl: "/family/dashboard",
      });
    }

    // ── Try Turso first (real accounts) ──────────────────────────────────
    let user: User | null = await tursoFindUserByEmail(normalizedEmail);

    // ── Fallback to in-memory store ───────────────────────────────────────
    if (!user) {
      const memUser = db.users.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (memUser) user = memUser;
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Identifiants invalides. Vérifiez votre email et mot de passe." },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Ce compte est désactivé. Veuillez contacter l'administrateur." },
        { status: 403 }
      );
    }

    const token = await createSessionCookie(user);

    const logEntry = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      action: "AUTH_LOGIN",
      details: `Connexion réussie (${user.role})`,
      createdAt: new Date().toISOString(),
    };

    await tursoInsertLog(logEntry);
    db.logs.unshift(logEntry);

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      token,
      redirectUrl: user.role === "admin" ? "/admin/dashboard" : "/family/dashboard",
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
