import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    // Return only active templates (public-facing — no admin restriction)
    const templates = db.activityTemplates.filter((t) => t.isActive);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Activity templates (public) GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
