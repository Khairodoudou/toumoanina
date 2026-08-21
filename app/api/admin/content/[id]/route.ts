import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  tursoUpdateContentItem,
  tursoDeleteContentItem,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const hasTurso = !!getTursoClient();

    if (hasTurso) {
      await tursoUpdateContentItem(id, body);
    }

    const idx = db.contentItems.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const updated = {
        ...db.contentItems[idx],
        ...body,
        id,
        updatedAt: new Date().toISOString(),
      };
      db.contentItems[idx] = updated;
      return NextResponse.json({ item: updated });
    }

    return NextResponse.json({ item: { id, ...body } });
  } catch (error) {
    console.error("Content PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hasTurso = !!getTursoClient();

    if (hasTurso) {
      await tursoDeleteContentItem(id);
    }

    const idx = db.contentItems.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.contentItems.splice(idx, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
