import { NextResponse } from "next/server";
import { resetDatabase } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function POST() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    resetDatabase();
    return NextResponse.json({
      success: true,
      message: "Données de démonstration réinitialisées avec succès.",
    });
  } catch (error) {
    console.error("Reset demo error:", error);
    return NextResponse.json({ error: "Erreur lors de la réinitialisation." }, { status: 500 });
  }
}
