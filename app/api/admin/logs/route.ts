import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { tursoGetAuditLogs } from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      const logs = await tursoGetAuditLogs(100);
      if (logs.length > 0) {
        return NextResponse.json({ logs });
      }
    }

    return NextResponse.json({ logs: db.logs });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ error: "Erreur serveur logs admin." }, { status: 500 });
  }
}
