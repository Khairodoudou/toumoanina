import { NextResponse } from "next/server";
import { db, Patient } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      // Return demo patient if unauthenticated for seamless exploration
      return NextResponse.json({
        patients: db.patients.filter((p) => p.familyId === "usr_family_demo"),
      });
    }

    if (user.role === "admin") {
      return NextResponse.json({ patients: db.patients });
    }

    const familyPatients = db.patients.filter((p) => p.familyId === user.id);
    return NextResponse.json({ patients: familyPatients });
  } catch (error) {
    console.error("Patients GET API error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des patients." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const familyId = user?.id || "usr_family_demo";

    const body = await req.json();
    const {
      name,
      birthDate,
      bloodType,
      emergencyPhone,
      photoUrl,
      dailyHabits,
      dietPreferences,
      medicalNotes,
      safeLatitude,
      safeLongitude,
      safeRadiusMeters,
    } = body;

    if (!name || !emergencyPhone) {
      return NextResponse.json(
        { error: "Le nom et le numéro d'urgence sont requis." },
        { status: 400 }
      );
    }

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      familyId,
      name: name.trim(),
      birthDate: birthDate || "1950-01-01",
      bloodType: bloodType || "O+",
      emergencyPhone: emergencyPhone.trim(),
      photoUrl: photoUrl?.trim() || "",
      dailyHabits: dailyHabits || "",
      dietPreferences: dietPreferences || "",
      medicalNotes: medicalNotes || "",
      safeLatitude: Number(safeLatitude) || 36.7538,
      safeLongitude: Number(safeLongitude) || 3.0588,
      safeRadiusMeters: Number(safeRadiusMeters) || 600,
      createdAt: new Date().toISOString(),
    };

    db.patients.unshift(newPatient);

    // If user has no active patient, set this one
    if (user && !user.activePatientId) {
      user.activePatientId = newPatient.id;
    }

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });
  } catch (error) {
    console.error("Patients POST API error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du patient." }, { status: 500 });
  }
}
