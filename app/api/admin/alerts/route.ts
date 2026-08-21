import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const alerts = db.alerts
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
      .map((a) => {
        const family = db.users.find((u) => u.id === a.familyId);
        return {
          ...a,
          familyName: family?.name ?? "—",
          familyEmail: family?.email ?? "—",
        };
      });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Admin alerts error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
