import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, sanitizeUser, clearSessionCookie } from "@/lib/server/auth";
import { db, hashPassword, verifyPassword } from "@/lib/server/db";
import { tursoUpdateUserProfile, tursoFindUserById } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, patientExitPin, activePatientId, currentPassword, newPassword } = body;
    const hasTurso = !!getTursoClient();

    let passwordHashToSet: string | undefined = undefined;

    if (newPassword) {
      const currentHash = user.passwordHash || db.users.find((u) => u.id === user.id)?.passwordHash || "";
      if (!currentPassword || !verifyPassword(currentPassword, currentHash)) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect." },
          { status: 400 }
        );
      }
      passwordHashToSet = hashPassword(newPassword);
    }

    // Update in Turso
    if (hasTurso) {
      await tursoUpdateUserProfile(user.id, {
        name,
        phone,
        patientExitPin,
        activePatientId,
        passwordHash: passwordHashToSet,
      });
    }

    // Also update in-memory
    const dbUser = db.users.find((u) => u.id === user.id);
    if (dbUser) {
      if (passwordHashToSet) dbUser.passwordHash = passwordHashToSet;
      if (name) dbUser.name = name;
      if (phone !== undefined) dbUser.phone = phone;
      if (patientExitPin) dbUser.patientExitPin = patientExitPin;
      if (activePatientId !== undefined) dbUser.activePatientId = activePatientId;
    }

    const updatedUser = hasTurso ? await tursoFindUserById(user.id) : dbUser;

    return NextResponse.json({
      success: true,
      user: sanitizeUser(updatedUser || user),
    });
  } catch (error) {
    console.error("Auth Me update error:", error);
    return NextResponse.json({ error: "Erreur serveur mise à jour profil." }, { status: 500 });
  }
}

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Déconnecté avec succès." });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Erreur lors de la déconnexion." }, { status: 500 });
  }
}
