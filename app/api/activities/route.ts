import { NextResponse } from "next/server";
import { db, ActivityRecord } from "@/lib/server/db";
import { tursoGetActivities, tursoInsertActivity } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") || db.patients[0]?.id;
    const hasTurso = !!getTursoClient();

    if (!patientId) {
      if (hasTurso) {
        const activities = await tursoGetActivities();
        return NextResponse.json({ activities });
      }
      return NextResponse.json({ activities: [] });
    }

    if (hasTurso) {
      const activities = await tursoGetActivities(patientId);
      return NextResponse.json({ activities });
    }

    const activities = db.activities
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activities GET error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des activités." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hasTurso = !!getTursoClient();

    const {
      patientId,
      activityType = "memory_pairs",
      score = 100,
      turns = 10,
      durationSeconds = 60,
    } = body;

    const targetPatientId = patientId || db.patients[0]?.id || "pat_demo";

    const newActivity: ActivityRecord = {
      id: `act_${Date.now()}`,
      patientId: targetPatientId,
      activityType,
      score: Number(score) || 100,
      turns: Number(turns) || 1,
      durationSeconds: Number(durationSeconds) || 60,
      completedAt: new Date().toISOString(),
    };

    if (hasTurso) {
      await tursoInsertActivity(newActivity);
    }
    db.activities.unshift(newActivity);

    return NextResponse.json({ success: true, activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error("Activities POST error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'activité." }, { status: 500 });
  }
}
