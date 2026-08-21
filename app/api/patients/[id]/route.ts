import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = db.patients.find((p) => p.id === id);

    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const latestLocation = db.locations
      .filter((l) => l.patientId === id)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0] || null;

    const latestMood = db.moods
      .filter((m) => m.patientId === id)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0] || null;

    return NextResponse.json({
      patient,
      latestLocation,
      latestMood,
    });
  } catch (error) {
    console.error("Patient GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = db.patients.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const body = await req.json();
    db.patients[index] = {
      ...db.patients[index],
      ...body,
      safeLatitude: body.safeLatitude !== undefined ? Number(body.safeLatitude) : db.patients[index].safeLatitude,
      safeLongitude: body.safeLongitude !== undefined ? Number(body.safeLongitude) : db.patients[index].safeLongitude,
      safeRadiusMeters: body.safeRadiusMeters !== undefined ? Number(body.safeRadiusMeters) : db.patients[index].safeRadiusMeters,
    };

    return NextResponse.json({ success: true, patient: db.patients[index] });
  } catch (error) {
    console.error("Patient PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = db.patients.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    db.patients.splice(index, 1);
    return NextResponse.json({ success: true, message: "Patient supprimé." });
  } catch (error) {
    console.error("Patient DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression." }, { status: 500 });
  }
}
