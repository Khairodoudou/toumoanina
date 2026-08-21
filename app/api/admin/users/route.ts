import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { sanitizeUser, requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

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

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    const isPrimaryAdmin =
      user.email.toLowerCase() === "admin@gmail.com" || user.id === "usr_admin_demo";

    // Toggle active / disabled status
    if (typeof isActive === "boolean") {
      if (isPrimaryAdmin && !isActive) {
        return NextResponse.json(
          { error: "Le compte administrateur principal ne peut pas être désactivé." },
          { status: 403 }
        );
      }
      user.isActive = isActive;

      // Add audit log
      db.logs.unshift({
        id: `log_${Date.now()}`,
        action: isActive ? "ADMIN_USER_ACTIVATE" : "ADMIN_USER_DEACTIVATE",
        details: `${isActive ? "Activation" : "Désactivation"} du compte ${user.name} (${user.email})`,
        createdAt: new Date().toISOString(),
      });
    }

    // Role update with permissions
    if (role && (role === "family" || role === "admin")) {
      if (isPrimaryAdmin && role !== "admin") {
        return NextResponse.json(
          { error: "Le rôle de l'administrateur principal ne peut pas être modifié." },
          { status: 403 }
        );
      }
      user.role = role;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    return NextResponse.json({
      success: true,
      user: {
        ...sanitizeUser(user),
        isActive: user.isActive !== false,
      },
    });
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

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    if (user.email.toLowerCase() === "admin@gmail.com" || user.id === "usr_admin_demo") {
      return NextResponse.json(
        { error: "Le compte administrateur principal ne peut pas être supprimé." },
        { status: 403 }
      );
    }

    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      const deletedUser = db.users[idx];
      db.users.splice(idx, 1);

      // Clean up associated records
      const patientIds = db.patients.filter((p) => p.familyId === userId).map((p) => p.id);
      db.patients = db.patients.filter((p) => p.familyId !== userId);
      db.alerts = db.alerts.filter((a) => a.familyId !== userId);
      db.locations = db.locations.filter((l) => !patientIds.includes(l.patientId));
      db.moods = db.moods.filter((m) => !patientIds.includes(m.patientId));
      db.activities = db.activities.filter((a) => !patientIds.includes(a.patientId));

      // Audit log
      db.logs.unshift({
        id: `log_${Date.now()}`,
        action: "ADMIN_USER_DELETE",
        details: `Suppression du compte ${deletedUser.name} (${deletedUser.email})`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur suppression utilisateur." }, { status: 500 });
  }
}
