import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { sanitizeUser, requireAdmin } from "@/lib/server/auth";
import {
  tursoGetAllUsers,
  tursoUpdateUser,
  tursoDeleteUser,
  tursoCountPatients,
  tursoInsertLog,
} from "@/lib/server/turso-queries";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    // ── 1. Read from Turso (real persistent users) ────────────────────────
    const tursoUsers = await tursoGetAllUsers();

    if (tursoUsers.length > 0) {
      // Build stats with Turso patient counts
      const usersWithStats = await Promise.all(
        tursoUsers.map(async (u) => {
          const patientCount = await tursoCountPatients(u.id);
          const isActive = u.isActive !== false;
          return {
            ...sanitizeUser(u),
            isActive,
            patientCount,
            patientsCount: patientCount,
            status: isActive ? "active" : "disabled",
          };
        })
      );
      return NextResponse.json({ users: usersWithStats });
    }

    // ── 2. Fallback: in-memory (local dev / no Turso) ─────────────────────
    const usersWithStats = db.users.map((u) => {
      const patientCount = db.patients.filter((p) => p.familyId === u.id).length;
      const isActive = u.isActive !== false;
      return {
        ...sanitizeUser(u),
        isActive,
        patientCount,
        patientsCount: patientCount,
        status: isActive ? "active" : "disabled",
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Erreur serveur utilisateurs admin." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const { userId, name, phone, isActive, role } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis." }, { status: 400 });
    }

    const isPrimaryAdmin =
      userId === "usr_admin_demo" ||
      body.email?.toLowerCase() === "admin@gmail.com";

    if (isPrimaryAdmin && isActive === false) {
      return NextResponse.json(
        { error: "Le compte administrateur principal ne peut pas être désactivé." },
        { status: 403 }
      );
    }

    if (isPrimaryAdmin && role && role !== "admin") {
      return NextResponse.json(
        { error: "Le rôle de l'administrateur principal ne peut pas être modifié." },
        { status: 403 }
      );
    }

    // ── Update in Turso ───────────────────────────────────────────────────
    await tursoUpdateUser(userId, { name, phone, isActive, role });

    // ── Also update in-memory fallback ────────────────────────────────────
    const memUser = db.users.find((u) => u.id === userId);
    if (memUser) {
      if (name) memUser.name = name;
      if (phone !== undefined) memUser.phone = phone;
      if (typeof isActive === "boolean") memUser.isActive = isActive;
      if (role) memUser.role = role as "family" | "admin";
    }

    const logEntry = {
      id: `log_${Date.now()}`,
      userId: admin.id,
      userEmail: admin.email,
      action: "ADMIN_USER_UPDATE",
      details: `Modification du compte userId=${userId}`,
      createdAt: new Date().toISOString(),
    };
    await tursoInsertLog(logEntry);
    db.logs.unshift(logEntry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur modification utilisateur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis." }, { status: 400 });
    }

    if (userId === "usr_admin_demo") {
      return NextResponse.json(
        { error: "Le compte administrateur principal ne peut pas être supprimé." },
        { status: 403 }
      );
    }

    // ── Delete from Turso (cascade: patients, locations, moods, activities, alerts) ──
    await tursoDeleteUser(userId);

    // ── Also clean in-memory store ────────────────────────────────────────
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      const deletedUser = db.users[idx];
      db.users.splice(idx, 1);
      const patientIds = db.patients.filter((p) => p.familyId === userId).map((p) => p.id);
      db.patients = db.patients.filter((p) => p.familyId !== userId);
      db.alerts = db.alerts.filter((a) => a.familyId !== userId);
      db.locations = db.locations.filter((l) => !patientIds.includes(l.patientId));
      db.moods = db.moods.filter((m) => !patientIds.includes(m.patientId));
      db.activities = db.activities.filter((a) => !patientIds.includes(a.patientId));

      const logEntry = {
        id: `log_${Date.now()}`,
        userId: admin.id,
        userEmail: admin.email,
        action: "ADMIN_USER_DELETE",
        details: `Suppression du compte ${deletedUser.name} (${deletedUser.email})`,
        createdAt: new Date().toISOString(),
      };
      await tursoInsertLog(logEntry);
      db.logs.unshift(logEntry);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur suppression utilisateur." }, { status: 500 });
  }
}
