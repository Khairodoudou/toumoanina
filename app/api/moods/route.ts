import { NextResponse } from "next/server";
import { db, MoodRecord } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getSessionUser();
    const queryPatientId = searchParams.get("patientId");

    const patientId =
      queryPatientId ||
      user?.activePatientId ||
      (user ? db.patients.find((p) => p.familyId === user.id)?.id : null) ||
      db.patients[0]?.id;

    if (!patientId) {
      return NextResponse.json({ moods: [] });
    }

    const moods = db.moods
      .filter((m) => m.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    return NextResponse.json({ moods });
  } catch (error) {
    console.error("Moods GET error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des humeurs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getSessionUser();
    const {
      patientId: bodyPatientId,
      mood,
      notes,
      recordedBy = "caregiver",
    } = body;

    const validMoods = ["very_good", "good", "neutral", "difficult"];
    if (!mood || !validMoods.includes(mood)) {
      return NextResponse.json(
        { error: "Valeur d'humeur invalide ('very_good', 'good', 'neutral', 'difficult')." },
        { status: 400 }
      );
    }

    const targetPatientId =
      bodyPatientId ||
      user?.activePatientId ||
      (user ? db.patients.find((p) => p.familyId === user.id)?.id : null) ||
      db.patients[0]?.id;

    if (!targetPatientId) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const newMood: MoodRecord = {
      id: `mood_${Date.now()}`,
      patientId: targetPatientId,
      mood: mood as "very_good" | "good" | "neutral" | "difficult",
      notes: notes?.trim() || "",
      recordedBy: recordedBy || "caregiver",
      recordedAt: new Date().toISOString(),
    };

    db.moods.unshift(newMood);

    return NextResponse.json({ success: true, mood: newMood }, { status: 201 });
  } catch (error) {
    console.error("Moods POST error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'humeur." }, { status: 500 });
  }
}
