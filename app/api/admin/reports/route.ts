import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const totalFamilies = db.users.filter((u) => u.role === "family").length;
    const totalPatients = db.patients.length;
    const totalAlerts = db.alerts.length;
    const resolvedAlerts = db.alerts.filter((a) => a.isResolved).length;
    const unresolvedAlerts = totalAlerts - resolvedAlerts;
    const totalActivities = db.activities.length;
    const totalMoods = db.moods.length;
    const totalContent = db.contentItems.length;
    const publishedContent = db.contentItems.filter((c) => c.isPublished).length;

    // Alert breakdown by type
    const alertByType = {
      geofence_exit: db.alerts.filter((a) => a.type === "geofence_exit").length,
      manual_sos: db.alerts.filter((a) => a.type === "manual_sos").length,
      low_battery: db.alerts.filter((a) => a.type === "low_battery").length,
    };

    // Alert breakdown by severity
    const alertBySeverity = {
      high: db.alerts.filter((a) => a.severity === "high").length,
      medium: db.alerts.filter((a) => a.severity === "medium").length,
      low: db.alerts.filter((a) => a.severity === "low").length,
    };

    // Activities breakdown by type
    const activityByType = {
      memory_pairs: db.activities.filter((a) => a.activityType === "memory_pairs").length,
      photo_memory: db.activities.filter((a) => a.activityType === "photo_memory").length,
      daily_puzzle: db.activities.filter((a) => a.activityType === "daily_puzzle").length,
    };

    // Mood breakdown
    const moodBreakdown = {
      good: db.moods.filter((m) => m.mood === "good").length,
      neutral: db.moods.filter((m) => m.mood === "neutral").length,
      difficult: db.moods.filter((m) => m.mood === "difficult").length,
    };

    // Last 30 days: patient registrations per week
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;
    const WEEK = 7 * DAY;
    const weeklyPatients: { label: string; value: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now - (i + 1) * WEEK);
      const end = new Date(now - i * WEEK);
      const label = `S-${i + 1}`;
      const value = db.patients.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= start && d < end;
      }).length;
      weeklyPatients.push({ label, value });
    }

    return NextResponse.json({
      totalFamilies,
      totalPatients,
      totalAlerts,
      resolvedAlerts,
      unresolvedAlerts,
      totalActivities,
      totalMoods,
      totalContent,
      publishedContent,
      alertByType,
      alertBySeverity,
      activityByType,
      moodBreakdown,
      weeklyPatients,
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
