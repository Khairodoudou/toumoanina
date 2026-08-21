import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const patients = db.patients.map((p) => {
      const family = db.users.find((u) => u.id === p.familyId);
      const lastLoc = db.locations
        .filter((l) => l.patientId === p.id)
        .sort((a, b) => (a.recordedAt > b.recordedAt ? -1 : 1))[0];

      const lastMood = db.moods
        .filter((m) => m.patientId === p.id)
        .sort((a, b) => (a.recordedAt > b.recordedAt ? -1 : 1))[0];

      const activitiesCount = db.activities.filter((a) => a.patientId === p.id).length;

      return {
        id: p.id,
        name: p.name,
        birthDate: p.birthDate,
        bloodType: p.bloodType,
        familyId: p.familyId,
        familyName: family?.name ?? "—",
        familyEmail: family?.email ?? "—",
        emergencyPhone: p.emergencyPhone,
        lastPositionLat: lastLoc?.latitude ?? null,
        lastPositionLng: lastLoc?.longitude ?? null,
        lastPositionAt: lastLoc?.recordedAt ?? null,
        isInsideSafeZone: lastLoc?.isInsideSafeZone ?? null,
        lastMood: lastMood?.mood ?? null,
        lastMoodAt: lastMood?.recordedAt ?? null,
        activitiesCount,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("Admin patients error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
