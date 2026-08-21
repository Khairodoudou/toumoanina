"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, AlertTriangle, CheckCircle, ShieldAlert,
  Clock, Check, Filter, Loader2, RefreshCw, User,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface SafetyAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  isResolved: boolean;
  resolvedAt?: string;
  patientId: string;
  patientName: string;
  createdAt: string;
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return lang === "ar" ? "الآن" : "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return lang === "ar" ? `${Math.floor(diff / 3600)} س` : `${Math.floor(diff / 3600)}h`;
  return lang === "ar" ? `${Math.floor(diff / 86400)} يوم` : `${Math.floor(diff / 86400)}j`;
}

export default function AlertsPage() {
  const { t, language } = useI18n();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      });
      await fetchAlerts();
    } finally {
      setResolvingId(null);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "active") return !a.isResolved;
    if (filter === "resolved") return a.isResolved;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.isResolved).length;
  const resolvedCount = alerts.filter((a) => a.isResolved).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            {t.alerts.title}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.alerts.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            fetchAlerts();
          }}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {language === "ar" ? "تحديث" : "Actualiser"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-border/50 card-shadow">
        {[
          { key: "all", label: t.alerts.filterAll, count: alerts.length },
          { key: "active", label: t.alerts.filterActive, count: activeCount, alertBadge: activeCount > 0 },
          { key: "resolved", label: t.alerts.filterResolved, count: resolvedCount },
        ].map(({ key, label, count, alertBadge }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key as typeof filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === key
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text hover:bg-bg"
            }`}
          >
            <span>{label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                filter === key
                  ? "bg-white/20 text-white"
                  : alertBadge
                  ? "bg-red-500 text-white"
                  : "bg-bg text-text-muted"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-border/50 card-shadow text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-text mb-1">{t.alerts.emptyTitle}</h2>
          <p className="text-sm text-text-muted">{t.alerts.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isHigh = alert.severity === "high";
            return (
              <div
                key={alert.id}
                className={`rounded-3xl p-5 border transition-all card-shadow ${
                  alert.isResolved
                    ? "bg-white border-border/60 opacity-80"
                    : isHigh
                    ? "bg-red-50/60 border-red-200"
                    : "bg-amber-50/60 border-amber-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      alert.isResolved
                        ? "bg-emerald-100 text-emerald-600"
                        : isHigh
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {alert.isResolved ? (
                      <Check className="w-5 h-5" />
                    ) : isHigh ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          alert.isResolved
                            ? "bg-emerald-100 text-emerald-700"
                            : isHigh
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {alert.isResolved
                          ? t.alerts.badgeResolved
                          : isHigh
                          ? t.alerts.typeGeofence
                          : t.alerts.badgeActive}
                      </span>
                      {alert.patientName && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted bg-white/70 px-2 py-0.5 rounded-lg border border-border/40">
                          <User className="w-3 h-3 text-primary" />
                          {alert.patientName}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-text">{alert.title}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{alert.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 border-t border-border/40 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {timeAgo(alert.createdAt, language)} (
                        {new Date(alert.createdAt).toLocaleTimeString(
                          language === "ar" ? "ar-DZ" : "fr-FR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                        )
                      </span>
                      {alert.isResolved && alert.resolvedAt && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t.alerts.resolvedAt}{" "}
                          {new Date(alert.resolvedAt).toLocaleTimeString(
                            language === "ar" ? "ar-DZ" : "fr-FR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {!alert.isResolved && (
                    <button
                      type="button"
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolvingId === alert.id}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                    >
                      {resolvingId === alert.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{t.alerts.btnResolve}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
