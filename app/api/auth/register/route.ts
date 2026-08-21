import { NextResponse } from "next/server";
import { db, hashPassword, User } from "@/lib/server/db";
import { createSessionCookie, sanitizeUser } from "@/lib/server/auth";

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
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
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
      // No activePatientId — account starts with 0 patients
    };

    db.users.push(newUser);

    const token = await createSessionCookie(newUser);

    // Add audit log
    db.logs.unshift({
      id: `log_${Date.now()}`,
      userId: newUser.id,
      userEmail: newUser.email,
      action: "AUTH_REGISTER",
      details: `Création nouveau compte famille : ${newUser.email}`,
      createdAt: new Date().toISOString(),
    });

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
