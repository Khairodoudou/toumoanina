"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, Users, Bell, Activity, Smile, UserCheck,
  RefreshCw, ArrowRight, ArrowLeft, TrendingUp, Clock,
  CheckCircle, AlertTriangle, LogIn,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AdminStats {
  totalFamilies: number;
  totalPatients: number;
  totalAlerts: number;
  unresolvedAlerts: number;
  totalActivities: number;
  totalMoods: number;
  activeUsers: number;
  registrationChart: { label: string; value: number }[];
  alertChart: { label: string; value: number }[];
  feed: { id: string; type: string; text: string; at: string }[];
  systemStatus: string;
  lastCheck: string;
}

function CssBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-end gap-1.5 h-16 group">
      <div
        className={`w-7 rounded-t-md transition-all duration-500 ${color}`}
        style={{ height: `${Math.max(pct, 4)}%` }}
        title={`${value}`}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t, isRTL, language } = useI18n();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = stats
    ? [
        {
          icon: Users, label: t.admin.kpiFamilies,
          value: stats.totalFamilies, color: "bg-blue-50 text-blue-600", iconBg: "bg-blue-100",
          href: "/admin/families",
        },
        {
          icon: UserCheck, label: t.admin.kpiPatients,
          value: stats.totalPatients, color: "bg-violet-50 text-violet-600", iconBg: "bg-violet-100",
          href: "/admin/patients",
        },
        {
          icon: Bell, label: t.admin.kpiAlerts,
          value: stats.totalAlerts, color: "bg-orange-50 text-orange-600", iconBg: "bg-orange-100",
          href: "/admin/alerts",
        },
        {
          icon: AlertTriangle, label: t.admin.kpiAlertsUnresolved,
          value: stats.unresolvedAlerts, color: "bg-red-50 text-red-600", iconBg: "bg-red-100",
          href: "/admin/alerts",
        },
        {
          icon: Activity, label: t.admin.kpiActivities,
          value: stats.totalActivities, color: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-100",
          href: "/admin/activities",
        },
        {
          icon: Smile, label: t.admin.kpiMoods,
          value: stats.totalMoods, color: "bg-pink-50 text-pink-600", iconBg: "bg-pink-100",
          href: "/admin/reports",
        },
        {
          icon: CheckCircle, label: t.admin.kpiActiveUsers,
          value: stats.activeUsers, color: "bg-teal-50 text-teal-600", iconBg: "bg-teal-100",
          href: "/admin/users",
        },
        {
          icon: Shield, label: t.admin.kpiSystemHealth,
          value: stats.systemStatus === "healthy" ? t.admin.systemHealthy : "⚠️",
          color: "bg-slate-50 text-slate-700", iconBg: "bg-slate-200",
          href: "/admin/logs",
          isText: true,
        },
      ]
    : [];

  const regMax = Math.max(...(stats?.registrationChart?.map((c) => c.value) ?? [1]), 1);
  const altMax = Math.max(...(stats?.alertChart?.map((c) => c.value) ?? [1]), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            {t.admin.title}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => { setRefreshing(true); fetchStats(); }}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{t.admin.refreshBtn}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Link
                key={kpi.label}
                href={kpi.href}
                className={`relative rounded-2xl p-4 border border-border/60 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.iconBg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color.split(" ")[1]}`} />
                </div>
                {kpi.isText ? (
                  <p className="text-xs font-bold text-emerald-600 leading-tight">{kpi.value}</p>
                ) : (
                  <p className="text-2xl font-extrabold text-text">{kpi.value}</p>
                )}
                <p className="text-[11px] text-text-muted font-semibold mt-0.5 leading-tight">{kpi.label}</p>
                <ArrowIcon className="absolute bottom-3 end-3 w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registrations chart */}
            <div className="bg-white rounded-2xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-extrabold text-text">{t.admin.chartRegistrations}</h2>
              </div>
              <div className="flex items-end gap-2 h-20 px-1">
                {stats?.registrationChart.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-all duration-300"
                      style={{ height: `${Math.max((bar.value / regMax) * 64, 4)}px` }}
                      title={`${bar.value}`}
                    />
                    <span className="text-[9px] text-text-muted font-semibold">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts chart */}
            <div className="bg-white rounded-2xl border border-border/60 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-extrabold text-text">{t.admin.chartAlerts}</h2>
              </div>
              <div className="flex items-end gap-2 h-20 px-1">
                {stats?.alertChart.map((bar) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-orange-400 hover:bg-orange-500 transition-all duration-300"
                      style={{ height: `${Math.max((bar.value / altMax) * 64, 4)}px` }}
                      title={`${bar.value}`}
                    />
                    <span className="text-[9px] text-text-muted font-semibold">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl border border-border/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-extrabold text-text">{t.admin.recentActivityTitle}</h2>
            </div>
            {stats?.feed.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">{language === "ar" ? "لا يوجد نشاط بعد." : "Aucune activité récente."}</p>
            ) : (
              <ul className="divide-y divide-border/40">
                {stats?.feed.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-2.5">
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === "alert" ? "bg-red-100" :
                      item.type === "alert_resolved" ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      {item.type === "alert" ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> :
                       item.type === "alert_resolved" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
                       <LogIn className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text truncate">{item.text}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {new Date(item.at).toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
