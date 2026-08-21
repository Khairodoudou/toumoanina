"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart2, Users, UserCheck, Bell, Activity,
  Smile, BookOpen, CheckCircle, AlertTriangle,
  RefreshCw, Loader2, TrendingUp, Shield,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ReportData {
  totalFamilies: number;
  totalPatients: number;
  totalAlerts: number;
  resolvedAlerts: number;
  unresolvedAlerts: number;
  totalActivities: number;
  totalMoods: number;
  totalContent: number;
  publishedContent: number;
  alertByType: { geofence_exit: number; manual_sos: number; low_battery: number };
  alertBySeverity: { high: number; medium: number; low: number };
  activityByType: { memory_pairs: number; photo_memory: number; daily_puzzle: number };
  moodBreakdown: { good: number; neutral: number; difficult: number };
  weeklyPatients: { label: string; value: number }[];
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-text">{label}</span>
        <span className="text-text-muted font-mono font-bold">
          {value} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const { t, language } = useI18n();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-primary" />
            {t.admin.reportsTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.reportsSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchReports();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{t.admin.refreshBtn}</span>
        </button>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Numbers Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-border/60 card-shadow space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-text">{data.totalFamilies}</p>
              <p className="text-xs text-text-muted font-bold">{t.admin.reportTotalFamilies}</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/60 card-shadow space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-text">{data.totalPatients}</p>
              <p className="text-xs text-text-muted font-bold">{t.admin.reportTotalPatients}</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/60 card-shadow space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-text">{data.totalAlerts}</p>
              <p className="text-xs text-text-muted font-bold">{t.admin.reportTotalAlerts}</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/60 card-shadow space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-text">{data.totalActivities}</p>
              <p className="text-xs text-text-muted font-bold">{t.admin.reportTotalActivities}</p>
            </div>
          </div>

          {/* Detailed Analytical Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alerts by Type */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
              <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                {t.admin.alertsByType}
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label={t.admin.alertTypeGeofence}
                  value={data.alertByType.geofence_exit}
                  total={data.totalAlerts || 1}
                  color="bg-orange-500"
                />
                <ProgressBar
                  label={t.admin.alertTypeSOS}
                  value={data.alertByType.manual_sos}
                  total={data.totalAlerts || 1}
                  color="bg-red-500"
                />
                <ProgressBar
                  label={t.admin.alertTypeBattery}
                  value={data.alertByType.low_battery}
                  total={data.totalAlerts || 1}
                  color="bg-amber-500"
                />
              </div>
            </div>

            {/* Alerts by Severity */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
              <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                {t.admin.alertsBySeverity}
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label={t.admin.severityHigh}
                  value={data.alertBySeverity.high}
                  total={data.totalAlerts || 1}
                  color="bg-red-600"
                />
                <ProgressBar
                  label={t.admin.severityMedium}
                  value={data.alertBySeverity.medium}
                  total={data.totalAlerts || 1}
                  color="bg-orange-400"
                />
                <ProgressBar
                  label={t.admin.severityLow}
                  value={data.alertBySeverity.low}
                  total={data.totalAlerts || 1}
                  color="bg-blue-400"
                />
              </div>
            </div>

            {/* Activities by Type */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
              <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                {t.admin.activitiesByType}
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label={t.admin.activityTypeMemoryPairs}
                  value={data.activityByType.memory_pairs}
                  total={data.totalActivities || 1}
                  color="bg-emerald-500"
                />
                <ProgressBar
                  label={t.admin.activityTypePhotoMemory}
                  value={data.activityByType.photo_memory}
                  total={data.totalActivities || 1}
                  color="bg-teal-500"
                />
                <ProgressBar
                  label={t.admin.activityTypePuzzle}
                  value={data.activityByType.daily_puzzle}
                  total={data.totalActivities || 1}
                  color="bg-indigo-500"
                />
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
              <h3 className="font-extrabold text-base text-text flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-500" />
                {t.admin.moodDistribution}
              </h3>
              <div className="space-y-4">
                <ProgressBar
                  label={t.admin.moodGood}
                  value={data.moodBreakdown.good}
                  total={data.totalMoods || 1}
                  color="bg-emerald-500"
                />
                <ProgressBar
                  label={t.admin.moodNeutral}
                  value={data.moodBreakdown.neutral}
                  total={data.totalMoods || 1}
                  color="bg-blue-400"
                />
                <ProgressBar
                  label={t.admin.moodDifficult}
                  value={data.moodBreakdown.difficult}
                  total={data.totalMoods || 1}
                  color="bg-amber-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
