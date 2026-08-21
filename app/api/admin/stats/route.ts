import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const now = Date.now();
    const DAY = 24 * 3600 * 1000;

    // --- KPIs ---
    const totalFamilies = db.users.filter((u) => u.role === "family").length;
    const totalPatients = db.patients.length;
    const totalAlerts = db.alerts.length;
    const unresolvedAlerts = db.alerts.filter((a) => !a.isResolved).length;
    const totalActivities = db.activities.length;
    const totalMoods = db.moods.length;
    // Active = currently existing users who logged in within 7 days
    const existingUserIds = new Set(db.users.map((u) => u.id));
    const sevenDaysAgo = new Date(now - 7 * DAY).toISOString();
    const activeUserIds = new Set(
      db.logs
        .filter(
          (l) =>
            l.action === "AUTH_LOGIN" &&
            l.createdAt >= sevenDaysAgo &&
            l.userId &&
            existingUserIds.has(l.userId)
        )
        .map((l) => l.userId!)
    );
    const activeUsers = activeUserIds.size;

    // --- Last 7 days: registrations chart ---
    const registrationChart: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + DAY);
      const label = dayStart.toLocaleDateString("fr-DZ", { weekday: "short" });
      const value = db.users.filter((u) => {
        const d = new Date(u.createdAt);
        return d >= dayStart && d < dayEnd;
      }).length;
      registrationChart.push({ label, value });
    }

    // --- Last 7 days: alerts chart ---
    const alertChart: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + DAY);
      const label = dayStart.toLocaleDateString("fr-DZ", { weekday: "short" });
      const value = db.alerts.filter((a) => {
        const d = new Date(a.createdAt);
        return d >= dayStart && d < dayEnd;
      }).length;
      alertChart.push({ label, value });
    }

    // --- Recent activity feed (latest 15 events merged) ---
    type FeedItem = { id: string; type: string; text: string; at: string };
    const feed: FeedItem[] = [
      ...db.logs.slice(-10).map((l) => ({
        id: `log_${l.id}`,
        type: "log",
        text: `${l.userEmail ?? "?"} — ${l.action}: ${l.details}`,
        at: l.createdAt,
      })),
      ...db.alerts.slice(-5).map((a) => ({
        id: `alt_${a.id}`,
        type: a.isResolved ? "alert_resolved" : "alert",
        text: `${a.patientName}: ${a.title}`,
        at: a.createdAt,
      })),
    ]
      .sort((a, b) => (a.at > b.at ? -1 : 1))
      .slice(0, 15);

    return NextResponse.json({
      totalFamilies,
      totalPatients,
      totalAlerts,
      unresolvedAlerts,
      totalActivities,
      totalMoods,
      activeUsers,
      registrationChart,
      alertChart,
      feed,
      systemStatus: "healthy",
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Erreur serveur stats admin." }, { status: 500 });
  }
}
