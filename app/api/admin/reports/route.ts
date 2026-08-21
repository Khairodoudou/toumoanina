import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { getTursoClient } from "@/lib/server/turso";

async function tursoCount(sql: string, args: unknown[] = []): Promise<number> {
  const client = getTursoClient();
  if (!client) return 0;
  try {
    const res = await client.execute({ sql, args: args as any });
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

    const hasTurso = !!getTursoClient();
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;
    const WEEK = 7 * DAY;

    if (hasTurso) {
      const [
        totalFamilies,
        totalPatients,
        totalAlerts,
        resolvedAlerts,
        totalActivities,
        totalMoods,
        totalContent,
        publishedContent,
      ] = await Promise.all([
        tursoCount("SELECT COUNT(*) as cnt FROM users WHERE role = 'family'"),
        tursoCount("SELECT COUNT(*) as cnt FROM patients"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE is_resolved = 1"),
        tursoCount("SELECT COUNT(*) as cnt FROM activities"),
        tursoCount("SELECT COUNT(*) as cnt FROM moods"),
        tursoCount("SELECT COUNT(*) as cnt FROM content_items"),
        tursoCount("SELECT COUNT(*) as cnt FROM content_items WHERE is_published = 1"),
      ]);

      const unresolvedAlerts = totalAlerts - resolvedAlerts;

      const [
        geofenceExit,
        manualSos,
        lowBattery,
        highSeverity,
        medSeverity,
        lowSeverity,
        memoryPairs,
        photoMemory,
        dailyPuzzle,
        goodMood,
        neutralMood,
        diffMood,
      ] = await Promise.all([
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE type = 'geofence_exit'"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE type = 'manual_sos'"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE type = 'low_battery'"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE severity = 'high'"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE severity = 'medium'"),
        tursoCount("SELECT COUNT(*) as cnt FROM alerts WHERE severity = 'low'"),
        tursoCount("SELECT COUNT(*) as cnt FROM activities WHERE activity_type = 'memory_pairs'"),
        tursoCount("SELECT COUNT(*) as cnt FROM activities WHERE activity_type = 'photo_memory'"),
        tursoCount("SELECT COUNT(*) as cnt FROM activities WHERE activity_type = 'daily_puzzle'"),
        tursoCount("SELECT COUNT(*) as cnt FROM moods WHERE mood = 'good'"),
        tursoCount("SELECT COUNT(*) as cnt FROM moods WHERE mood = 'neutral'"),
        tursoCount("SELECT COUNT(*) as cnt FROM moods WHERE mood = 'difficult'"),
      ]);

      const weeklyPatients: { label: string; value: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now - (i + 1) * WEEK);
        const end = new Date(now - i * WEEK);
        const label = `S-${i + 1}`;
        const value = await tursoCount(
          "SELECT COUNT(*) as cnt FROM patients WHERE created_at >= ? AND created_at < ?",
          [start.toISOString(), end.toISOString()]
        );
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
        alertByType: {
          geofence_exit: geofenceExit,
          manual_sos: manualSos,
          low_battery: lowBattery,
        },
        alertBySeverity: {
          high: highSeverity,
          medium: medSeverity,
          low: lowSeverity,
        },
        activityByType: {
          memory_pairs: memoryPairs,
          photo_memory: photoMemory,
          daily_puzzle: dailyPuzzle,
        },
        moodBreakdown: {
          good: goodMood,
          neutral: neutralMood,
          difficult: diffMood,
        },
        weeklyPatients,
      });
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

    const alertByType = {
      geofence_exit: db.alerts.filter((a) => a.type === "geofence_exit").length,
      manual_sos: db.alerts.filter((a) => a.type === "manual_sos").length,
      low_battery: db.alerts.filter((a) => a.type === "low_battery").length,
    };

    const alertBySeverity = {
      high: db.alerts.filter((a) => a.severity === "high").length,
      medium: db.alerts.filter((a) => a.severity === "medium").length,
      low: db.alerts.filter((a) => a.severity === "low").length,
    };

    const activityByType = {
      memory_pairs: db.activities.filter((a) => a.activityType === "memory_pairs").length,
      photo_memory: db.activities.filter((a) => a.activityType === "photo_memory").length,
      daily_puzzle: db.activities.filter((a) => a.activityType === "daily_puzzle").length,
    };

    const moodBreakdown = {
      good: db.moods.filter((m) => m.mood === "good").length,
      neutral: db.moods.filter((m) => m.mood === "neutral").length,
      difficult: db.moods.filter((m) => m.mood === "difficult").length,
    };

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
