import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, sanitizeUser, clearSessionCookie } from "@/lib/server/auth";
import { db, hashPassword, verifyPassword } from "@/lib/server/db";

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

    const dbUser = db.users.find((u) => u.id === user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    if (newPassword) {
      if (!currentPassword || !verifyPassword(currentPassword, dbUser.passwordHash)) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est incorrect." },
          { status: 400 }
        );
      }
      dbUser.passwordHash = hashPassword(newPassword);
    }

    if (name) dbUser.name = name;
    if (phone !== undefined) dbUser.phone = phone;
    if (patientExitPin) dbUser.patientExitPin = patientExitPin;
    if (activePatientId !== undefined) dbUser.activePatientId = activePatientId;

    return NextResponse.json({ success: true, user: sanitizeUser(dbUser) });
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
