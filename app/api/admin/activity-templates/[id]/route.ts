import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const idx = db.activityTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "Template introuvable." }, { status: 404 });

    const updated = {
      ...db.activityTemplates[idx],
      ...body,
      id, // prevent id override
      updatedAt: new Date().toISOString(),
    };
    db.activityTemplates[idx] = updated;

    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error("Activity template PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idx = db.activityTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return NextResponse.json({ error: "Template introuvable." }, { status: 404 });

    db.activityTemplates.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity template DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
