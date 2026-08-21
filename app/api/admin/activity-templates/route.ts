import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import {
  tursoGetActivityTemplates,
  tursoInsertActivityTemplate,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      const templates = await tursoGetActivityTemplates();
      if (templates.length > 0) {
        return NextResponse.json({ templates });
      }
    }

    return NextResponse.json({ templates: db.activityTemplates });
  } catch (error) {
    console.error("Activity templates GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const { titleFr, titleAr, descriptionFr, descriptionAr, type, difficulty, durationMinutes } = body;

    if (!titleFr || !titleAr || !type || !difficulty) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newTemplate = {
      id: `tpl_${Date.now()}`,
      titleFr,
      titleAr,
      descriptionFr: descriptionFr || "",
      descriptionAr: descriptionAr || "",
      type,
      difficulty,
      durationMinutes: Number(durationMinutes) || 10,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      await tursoInsertActivityTemplate(newTemplate);
    }
    db.activityTemplates.push(newTemplate);

    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error("Activity templates POST error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
