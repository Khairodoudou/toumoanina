import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  tursoFindUserById,
  tursoGetPatientsByFamily,
  tursoGetAlerts,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hasTurso = !!getTursoClient();

    let user = hasTurso ? await tursoFindUserById(id) : null;
    if (!user) {
      user = db.users.find((u) => u.id === id && u.role === "family") || null;
    }

    if (!user) return NextResponse.json({ error: "Famille introuvable." }, { status: 404 });

    if (hasTurso) {
      const [patientsList, alertsList] = await Promise.all([
        tursoGetPatientsByFamily(id),
        tursoGetAlerts(id, 10),
      ]);

      const patients = patientsList.map((p) => {
        const lastLoc = db.locations
          .filter((l) => l.patientId === p.id)
          .sort((a, b) => (a.recordedAt > b.recordedAt ? -1 : 1))[0];
        return {
          id: p.id,
          name: p.name,
          birthDate: p.birthDate,
          bloodType: p.bloodType,
          emergencyPhone: p.emergencyPhone,
          lastPositionLat: lastLoc?.latitude ?? null,
          lastPositionLng: lastLoc?.longitude ?? null,
          lastPositionAt: lastLoc?.recordedAt ?? null,
          isInsideSafeZone: lastLoc?.isInsideSafeZone ?? null,
          createdAt: p.createdAt,
        };
      });

      return NextResponse.json({
        family: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
        patients,
        alerts: alertsList,
      });
    }

    const patients = db.patients
      .filter((p) => p.familyId === id)
      .map((p) => {
        const lastLoc = db.locations
          .filter((l) => l.patientId === p.id)
          .sort((a, b) => (a.recordedAt > b.recordedAt ? -1 : 1))[0];
        return {
          id: p.id,
          name: p.name,
          birthDate: p.birthDate,
          bloodType: p.bloodType,
          emergencyPhone: p.emergencyPhone,
          lastPositionLat: lastLoc?.latitude ?? null,
          lastPositionLng: lastLoc?.longitude ?? null,
          lastPositionAt: lastLoc?.recordedAt ?? null,
          isInsideSafeZone: lastLoc?.isInsideSafeZone ?? null,
          createdAt: p.createdAt,
        };
      });

    const alerts = db.alerts
      .filter((a) => a.familyId === id)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .slice(0, 10);

    return NextResponse.json({
      family: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
      patients,
      alerts,
    });
  } catch (error) {
    console.error("Admin family detail error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
