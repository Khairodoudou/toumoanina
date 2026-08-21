"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, Shield, AlertTriangle,
  Clock, Database, Loader2, RefreshCw,
  User, CheckCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AdminLogsPage() {
  const { t, language } = useI18n();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.userId && log.userId.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q));

    const matchesFilter =
      filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            {t.admin.logsTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {language === "ar"
              ? "سجل كامل لجميع العمليات والأحداث الأمنية في النظام"
              : "Historique complet des actions et événements de sécurité"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchLogs();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{language === "ar" ? "تحديث" : "Actualiser"}</span>
        </button>
      </div>

      {/* Controls: Search + Action Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "ar" ? "بحث في السجلات…" : "Rechercher une action, adresse IP…"}
            className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-2.5 rounded-2xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 card-shadow"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="py-2.5 px-4 rounded-2xl bg-white border border-border text-text text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 card-shadow cursor-pointer"
        >
          <option value="all">{language === "ar" ? "كل الأحداث" : "Toutes les actions"}</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">
            {language === "ar" ? "لا توجد سجلات مطابقة" : "Aucun journal trouvé"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-bg/50 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="p-4 sm:px-6">{language === "ar" ? "الحدث" : "Action"}</th>
                  <th className="p-4 sm:px-6">{language === "ar" ? "التفاصيل" : "Détails"}</th>
                  <th className="p-4 sm:px-6">IP / User</th>
                  <th className="p-4 sm:px-6">{language === "ar" ? "التاريخ والوقت" : "Date & Heure"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs font-mono">
                {filtered.map((log) => {
                  const isWarning =
                    log.action.includes("BREACH") || log.action.includes("ALERT");
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:px-6 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isWarning
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isWarning && <AlertTriangle className="w-2.5 h-2.5" />}
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 sm:px-6 font-sans text-text text-xs leading-relaxed max-w-md">
                        {log.details}
                      </td>
                      <td className="p-4 sm:px-6 text-text-muted text-[11px]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="p-4 sm:px-6 text-text-muted text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(
                          language === "ar" ? "ar-DZ" : "fr-FR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
