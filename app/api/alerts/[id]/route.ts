import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { tursoResolveAlert } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const hasTurso = !!getTursoClient();

    if (body.isResolved && hasTurso) {
      await tursoResolveAlert(id);
    }

    const alert = db.alerts.find((a) => a.id === id);
    if (alert) {
      if (body.isResolved !== undefined) {
        alert.isResolved = Boolean(body.isResolved);
        alert.resolvedAt = body.isResolved ? new Date().toISOString() : undefined;
      }
    }

    return NextResponse.json({ success: true, alert: alert || { id, isResolved: true } });
  } catch (error) {
    console.error("Alert PATCH error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'alerte." }, { status: 500 });
  }
}
