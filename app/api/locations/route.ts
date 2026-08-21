import { NextResponse } from "next/server";
import {
  db,
  LocationRecord,
  SafetyAlert,
  calculateDistanceMeters,
} from "@/lib/server/db";
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
      return NextResponse.json({ locations: [] });
    }

    const locations = db.locations
      .filter((l) => l.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des positions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getSessionUser();
    const {
      patientId: bodyPatientId,
      latitude,
      longitude,
      accuracy = 10,
      source = "patient_device",
    } = body;

    const targetPatientId =
      bodyPatientId ||
      user?.activePatientId ||
      (user ? db.patients.find((p) => p.familyId === user.id)?.id : null) ||
      db.patients[0]?.id;

    const patient = db.patients.find((p) => p.id === targetPatientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient introuvable." }, { status: 404 });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    const distance = calculateDistanceMeters(
      lat,
      lng,
      patient.safeLatitude,
      patient.safeLongitude
    );

    const isInsideSafeZone = distance <= patient.safeRadiusMeters;
    let alertTriggered = false;

    // If outside safe perimeter, trigger safety alert
    if (!isInsideSafeZone) {
      alertTriggered = true;
      const newAlert: SafetyAlert = {
        id: `alt_${Date.now()}`,
        familyId: patient.familyId,
        patientId: patient.id,
        patientName: patient.name,
        type: "geofence_exit",
        title: "Sortie de zone de sécurité détectée",
        description: `${patient.name} se trouve à ${distance}m du domicile (rayon autorisé : ${patient.safeRadiusMeters}m).`,
        latitude: lat,
        longitude: lng,
        severity: "high",
        isResolved: false,
        createdAt: new Date().toISOString(),
      };
      db.alerts.unshift(newAlert);
    }

    const newLocation: LocationRecord = {
      id: `loc_${Date.now()}`,
      patientId: patient.id,
      latitude: lat,
      longitude: lng,
      accuracy: Number(accuracy) || 10,
      isInsideSafeZone,
      distanceFromHomeMeters: distance,
      recordedAt: new Date().toISOString(),
      source: source || "patient_device",
    };

    db.locations.unshift(newLocation);

    return NextResponse.json({
      success: true,
      location: newLocation,
      isInsideSafeZone,
      distanceFromHomeMeters: distance,
      alertTriggered,
    });
  } catch (error) {
    console.error("Locations POST error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de la position." }, { status: 500 });
  }
}
