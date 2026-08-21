import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  tursoUpdateActivityTemplate,
  tursoDeleteActivityTemplate,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const hasTurso = !!getTursoClient();

    if (hasTurso) {
      await tursoUpdateActivityTemplate(id, body);
    }

    const idx = db.activityTemplates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const updated = {
        ...db.activityTemplates[idx],
        ...body,
        id,
        updatedAt: new Date().toISOString(),
      };
      db.activityTemplates[idx] = updated;
      return NextResponse.json({ template: updated });
    }

    return NextResponse.json({ template: { id, ...body } });
  } catch (error) {
    console.error("Activity template PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hasTurso = !!getTursoClient();

    if (hasTurso) {
      await tursoDeleteActivityTemplate(id);
    }

    const idx = db.activityTemplates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      db.activityTemplates.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity template DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
