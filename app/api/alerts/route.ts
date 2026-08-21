import { NextResponse } from "next/server";
import { db, SafetyAlert } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ alerts: db.alerts });
    }

    if (user.role === "admin") {
      return NextResponse.json({ alerts: db.alerts });
    }

    const familyAlerts = db.alerts.filter((a) => a.familyId === user.id || a.familyId === "usr_family_demo");
    return NextResponse.json({ alerts: familyAlerts });
  } catch (error) {
    console.error("Alerts GET error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des alertes." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, title, description, severity = "high" } = body;

    const patient = db.patients.find((p) => p.id === patientId) || db.patients[0];
    const newAlert: SafetyAlert = {
      id: `alt_${Date.now()}`,
      familyId: patient?.familyId || "usr_family_demo",
      patientId: patient?.id || "pat_mohammed_1",
      patientName: patient?.name || "Patient",
      type: "manual_sos",
      title: title || "Appel d'urgence manuel",
      description: description || "Déclenché manuellement",
      severity,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    db.alerts.unshift(newAlert);
    return NextResponse.json({ success: true, alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error("Alerts POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'alerte." }, { status: 500 });
  }
}
