"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, Search, Filter, AlertTriangle, CheckCircle,
  MapPin, Clock, Loader2, RefreshCw, Shield, AlertCircle,
  BatteryCharging, Radio,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AdminAlert {
  id: string;
  familyId: string;
  familyName: string;
  familyEmail: string;
  patientId: string;
  patientName: string;
  type: "geofence_exit" | "manual_sos" | "low_battery";
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  severity: "high" | "medium" | "low";
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export default function AdminAlertsPage() {
  const { t, language } = useI18n();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved" | "high">("all");

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filtered = alerts.filter((a) => {
    // Filter type
    if (filter === "unresolved" && a.isResolved) return false;
    if (filter === "resolved" && !a.isResolved) return false;
    if (filter === "high" && a.severity !== "high") return false;

    // Search query
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.familyName.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
              <Bell className="w-8 h-8 text-orange-500" />
              {t.admin.alertsListTitle}
            </h1>
            {unresolvedCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 animate-pulse">
                {unresolvedCount} {t.admin.filterUnresolved}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1">{t.admin.alertsSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchAlerts();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{t.admin.refreshBtn}</span>
        </button>
      </div>

      {/* Controls: Search + Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.patients.searchPlaceholder}
            className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 card-shadow"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              filter === "all" ? "bg-white text-text shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {t.admin.filterAll} ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unresolved")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              filter === "unresolved"
                ? "bg-red-500 text-white shadow-sm"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            {t.admin.filterUnresolved} ({unresolvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              filter === "resolved"
                ? "bg-white text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t.admin.filterResolved}
          </button>
          <button
            type="button"
            onClick={() => setFilter("high")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              filter === "high"
                ? "bg-white text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t.admin.filterHigh}
          </button>
        </div>
      </div>

      {/* Alerts Table Card */}
      <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-text">{t.admin.noAlerts}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      alert.severity === "high"
                        ? "bg-red-100 text-red-600"
                        : alert.severity === "medium"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {alert.type === "geofence_exit" ? (
                      <Radio className="w-5 h-5" />
                    ) : alert.type === "manual_sos" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <BatteryCharging className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          alert.severity === "high"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : alert.severity === "medium"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {alert.severity === "high"
                          ? t.admin.severityHigh
                          : alert.severity === "medium"
                          ? t.admin.severityMedium
                          : t.admin.severityLow}
                      </span>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {alert.type === "geofence_exit"
                          ? t.admin.alertTypeGeofence
                          : alert.type === "manual_sos"
                          ? t.admin.alertTypeSOS
                          : t.admin.alertTypeBattery}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          alert.isResolved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {alert.isResolved ? t.admin.alertResolved : t.admin.alertUnresolved}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-text">{alert.title}</h3>
                    <p className="text-xs text-text-muted">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-text-muted">
                      <span className="font-bold text-text">
                        {t.admin.colPatientName}: {alert.patientName}
                      </span>
                      <span>•</span>
                      <span>
                        {t.admin.colFamily}: {alert.familyName}
                      </span>
                      {alert.latitude && alert.longitude && (
                        <>
                          <span>•</span>
                          <span className="font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right rtl:text-left text-xs text-text-muted flex-shrink-0 font-mono">
                  <p className="flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(alert.createdAt).toLocaleString(
                      language === "ar" ? "ar-DZ" : "fr-FR"
                    )}
                  </p>
                  {alert.resolvedAt && (
                    <p className="text-[10px] text-emerald-600 mt-1">
                      {t.admin.alertResolved}: {new Date(alert.resolvedAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
