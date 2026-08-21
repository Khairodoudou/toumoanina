import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    return NextResponse.json({ logs: db.logs });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ error: "Erreur serveur logs admin." }, { status: 500 });
  }
}
