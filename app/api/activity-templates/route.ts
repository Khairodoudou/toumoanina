import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { tursoGetActivityTemplates } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      const templates = await tursoGetActivityTemplates();
      if (templates.length > 0) {
        return NextResponse.json({ templates: templates.filter((t) => t.isActive) });
      }
    }

    // Return only active templates (public-facing — no admin restriction)
    const templates = db.activityTemplates.filter((t) => t.isActive);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Activity templates (public) GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
