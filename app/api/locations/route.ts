import { NextResponse } from "next/server";
import {
  db,
  LocationRecord,
  SafetyAlert,
  calculateDistanceMeters,
} from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import {
  tursoGetLocations,
  tursoInsertLocation,
  tursoFindPatientById,
  tursoGetPatientsByFamily,
  tursoInsertAlert,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getSessionUser();
    const queryPatientId = searchParams.get("patientId");
    const hasTurso = !!getTursoClient();

    let targetPatientId = queryPatientId || user?.activePatientId;

    if (!targetPatientId && user) {
      if (hasTurso) {
        const userPatients = await tursoGetPatientsByFamily(user.id);
        targetPatientId = userPatients[0]?.id;
      }
      if (!targetPatientId) {
        targetPatientId = db.patients.find((p) => p.familyId === user.id)?.id;
      }
    }

    if (!targetPatientId) {
      targetPatientId = db.patients[0]?.id;
    }

    if (!targetPatientId) {
      return NextResponse.json({ locations: [] });
    }

    if (hasTurso) {
      const locations = await tursoGetLocations(targetPatientId);
      return NextResponse.json({ locations });
    }

    const locations = db.locations
      .filter((l) => l.patientId === targetPatientId)
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
    const hasTurso = !!getTursoClient();

    const {
      patientId: bodyPatientId,
      latitude,
      longitude,
      accuracy = 10,
      source = "patient_device",
    } = body;

    let targetPatientId = bodyPatientId || user?.activePatientId;

    if (!targetPatientId && user) {
      if (hasTurso) {
        const userPatients = await tursoGetPatientsByFamily(user.id);
        targetPatientId = userPatients[0]?.id;
      }
      if (!targetPatientId) {
        targetPatientId = db.patients.find((p) => p.familyId === user.id)?.id;
      }
    }

    if (!targetPatientId) {
      targetPatientId = db.patients[0]?.id;
    }

    let patient = hasTurso && targetPatientId ? await tursoFindPatientById(targetPatientId) : null;
    if (!patient) {
      patient = db.patients.find((p) => p.id === targetPatientId) || null;
    }

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
      await tursoInsertAlert(newAlert);
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

    await tursoInsertLocation(newLocation);
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
