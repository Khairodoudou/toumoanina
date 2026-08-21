import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import {
  tursoGetContentItems,
  tursoInsertContentItem,
} from "@/lib/server/turso-queries";
import { getTursoClient } from "@/lib/server/turso";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      const items = await tursoGetContentItems(false);
      if (items.length > 0) {
        return NextResponse.json({ items });
      }
    }

    return NextResponse.json({ items: db.contentItems });
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const { titleFr, titleAr, contentFr, contentAr, category } = body;

    if (!titleFr || !titleAr || !contentFr || !contentAr) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newItem = {
      id: `cnt_${Date.now()}`,
      titleFr,
      titleAr,
      contentFr,
      contentAr,
      category: category || "advice",
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };

    const hasTurso = !!getTursoClient();
    if (hasTurso) {
      await tursoInsertContentItem(newItem);
    }
    db.contentItems.push(newItem);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Content POST error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
