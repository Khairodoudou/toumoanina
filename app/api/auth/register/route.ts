import { NextResponse } from "next/server";
import { db, hashPassword, User } from "@/lib/server/db";
import { createSessionCookie, sanitizeUser } from "@/lib/server/auth";
import {
  tursoFindUserByEmail,
  tursoInsertUser,
  tursoInsertLog,
} from "@/lib/server/turso-queries";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Check Turso first (persistent store) ─────────────────────────────
    const tursoExisting = await tursoFindUserByEmail(normalizedEmail);
    if (tursoExisting) {
      return NextResponse.json(
        { error: "Un compte avec cette adresse email existe déjà." },
        { status: 409 }
      );
    }

    // ── Fallback: check in-memory store too ───────────────────────────────
    const memExisting = db.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (memExisting) {
      return NextResponse.json(
        { error: "Un compte avec cette adresse email existe déjà." },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      role: "family",
      passwordHash: hashPassword(password),
      patientExitPin: "1234",
      createdAt: new Date().toISOString(),
    };

    // ── Write to Turso (primary persistent store) ─────────────────────────
    const savedToTurso = await tursoInsertUser(newUser);

    // ── Always write to in-memory too (for current request lifecycle) ─────
    db.users.push(newUser);

    const token = await createSessionCookie(newUser);

    const logEntry = {
      id: `log_${Date.now()}`,
      userId: newUser.id,
      userEmail: newUser.email,
      action: "AUTH_REGISTER",
      details: `Création nouveau compte famille : ${newUser.email}`,
      createdAt: new Date().toISOString(),
    };

    // Write audit log to Turso
    await tursoInsertLog(logEntry);
    // Also keep in-memory log
    db.logs.unshift(logEntry);

    console.log(
      `[Register] User ${newUser.email} created. Turso persisted: ${savedToTurso}`
    );

    return NextResponse.json({
      success: true,
      user: sanitizeUser(newUser),
      token,
      redirectUrl: "/family/dashboard",
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors de l'inscription." },
      { status: 500 }
    );
  }
}
