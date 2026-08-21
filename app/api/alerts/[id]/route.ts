import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = db.alerts.find((a) => a.id === id);

    if (!alert) {
      return NextResponse.json({ error: "Alerte introuvable." }, { status: 404 });
    }

    const body = await req.json();
    if (body.isResolved !== undefined) {
      alert.isResolved = Boolean(body.isResolved);
      alert.resolvedAt = body.isResolved ? new Date().toISOString() : undefined;
    }

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error("Alert PATCH error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'alerte." }, { status: 500 });
  }
}
