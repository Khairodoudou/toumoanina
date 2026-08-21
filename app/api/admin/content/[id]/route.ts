import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const idx = db.contentItems.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

    const updated = {
      ...db.contentItems[idx],
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.contentItems[idx] = updated;

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("Content PUT error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idx = db.contentItems.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });

    db.contentItems.splice(idx, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
