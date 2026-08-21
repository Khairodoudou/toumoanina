import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getTursoClient } from "@/lib/server/turso";

async function tursoCount(sql: string): Promise<number> {
  const client = getTursoClient();
  if (!client) return 0;
  try {
    const res = await client.execute(sql);
    return (res.rows[0]?.cnt as number) ?? 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const now = Date.now();
    const DAY = 24 * 3600 * 1000;
    const client = getTursoClient();
    const useTurso = !!client;

    // ── KPIs ──────────────────────────────────────────────────────────────
    let totalFamilies: number;
    let totalPatients: number;
    let totalAlerts: number;
    let unresolvedAlerts: number;
    let totalActivities: number;
    let totalMoods: number;

    if (useTurso) {
      [totalFamilies, totalPatients, totalAlerts, unresolvedAlerts, totalActivities, totalMoods] =
        await Promise.all([
          tursoCount("SELECT COUNT(*) as cnt FROM users WHERE role = 'family'"),
          tursoCount("SELECT COUNT(*) as cnt FROM patients"),
          tursoCount("SELECT COUNT(*) as cnt FROM alerts"),
          tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE is_resolved = 0"),
          tursoCount("SELECT COUNT(*) as cnt FROM activities"),
          tursoCount("SELECT COUNT(*) as cnt FROM moods"),
        ]);
    } else {
      totalFamilies = db.users.filter((u) => u.role === "family").length;
      totalPatients = db.patients.length;
      totalAlerts = db.alerts.length;
      unresolvedAlerts = db.alerts.filter((a) => !a.isResolved).length;
      totalActivities = db.activities.length;
      totalMoods = db.moods.length;
    }

    // ── Active users (last 7 days) ─────────────────────────────────────────
    let activeUsers = 0;
    if (useTurso) {
      const sevenDaysAgo = new Date(now - 7 * DAY).toISOString();
      const res = await client!.execute({
        sql: "SELECT COUNT(DISTINCT user_id) as cnt FROM audit_logs WHERE action = 'AUTH_LOGIN' AND created_at >= ?",
        args: [sevenDaysAgo],
      });
      activeUsers = (res.rows[0]?.cnt as number) ?? 0;
    } else {
      const sevenDaysAgo = new Date(now - 7 * DAY).toISOString();
      const existingUserIds = new Set(db.users.map((u) => u.id));
      activeUsers = new Set(
        db.logs
          .filter(
            (l) =>
              l.action === "AUTH_LOGIN" &&
              l.createdAt >= sevenDaysAgo &&
              l.userId &&
              existingUserIds.has(l.userId)
          )
          .map((l) => l.userId!)
      ).size;
    }

    // ── Last 7 days registration chart ───────────────────────────────────
    const registrationChart: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + DAY);
      const label = dayStart.toLocaleDateString("fr-DZ", { weekday: "short" });
      let value = 0;
      if (useTurso) {
        const res = await client!.execute({
          sql: "SELECT COUNT(*) as cnt FROM users WHERE created_at >= ? AND created_at < ?",
          args: [dayStart.toISOString(), dayEnd.toISOString()],
        });
        value = (res.rows[0]?.cnt as number) ?? 0;
      } else {
        value = db.users.filter((u) => {
          const d = new Date(u.createdAt);
          return d >= dayStart && d < dayEnd;
        }).length;
      }
      registrationChart.push({ label, value });
    }

    // ── Last 7 days alerts chart ─────────────────────────────────────────
    const alertChart: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * DAY);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + DAY);
      const label = dayStart.toLocaleDateString("fr-DZ", { weekday: "short" });
      let value = 0;
      if (useTurso) {
        const res = await client!.execute({
          sql: "SELECT COUNT(*) as cnt FROM alerts WHERE created_at >= ? AND created_at < ?",
          args: [dayStart.toISOString(), dayEnd.toISOString()],
        });
        value = (res.rows[0]?.cnt as number) ?? 0;
      } else {
        value = db.alerts.filter((a) => {
          const d = new Date(a.createdAt);
          return d >= dayStart && d < dayEnd;
        }).length;
      }
      alertChart.push({ label, value });
    }

    // ── Recent activity feed ─────────────────────────────────────────────
    type FeedItem = { id: string; type: string; text: string; at: string };
    let feed: FeedItem[] = [];

    if (useTurso) {
      const logsRes = await client!.execute(
        "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10"
      );
      const alertsRes = await client!.execute(
        "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5"
      );
      feed = [
        ...logsRes.rows.map((l) => ({
          id: `log_${l.id}`,
          type: "log",
          text: `${(l.user_email as string) ?? "?"} — ${l.action}: ${l.details}`,
          at: l.created_at as string,
        })),
        ...alertsRes.rows.map((a) => ({
          id: `alt_${a.id}`,
          type: a.is_resolved ? "alert_resolved" : "alert",
          text: `${a.patient_name}: ${a.title}`,
          at: a.created_at as string,
        })),
      ]
        .sort((a, b) => (a.at > b.at ? -1 : 1))
        .slice(0, 15);
    } else {
      feed = [
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
    }

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
