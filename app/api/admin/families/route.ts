import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { tursoGetAllUsers, tursoCountPatients } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const hasTurso = !!getTursoClient();

    if (hasTurso) {
      const allUsers = await tursoGetAllUsers();
      const familyUsers = allUsers.filter((u) => u.role === "family");

      const families = await Promise.all(
        familyUsers.map(async (u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          patientsCount: await tursoCountPatients(u.id),
          createdAt: u.createdAt,
        }))
      );

      return NextResponse.json({ families });
    }

    const families = db.users
      .filter((u) => u.role === "family")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        patientsCount: db.patients.filter((p) => p.familyId === u.id).length,
        createdAt: u.createdAt,
      }));

    return NextResponse.json({ families });
  } catch (error) {
    console.error("Admin families error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
