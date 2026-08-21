"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bell, CheckCircle, Loader2, AlertTriangle, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function PatientAlertsPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("all");
  const [patientName, setPatientName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, altRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/alerts?patientId=${id}`),
      ]);
      if (patRes.ok) { const d = await patRes.json(); setPatientName(d.patient?.name || ""); }
      if (altRes.ok) { const d = await altRes.json(); setAlerts(d.alerts || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isResolved: true }) });
    await fetchData();
  };

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.isResolved;
    if (filter === "resolved") return a.isResolved;
    return true;
  });

  const TABS = [
    { key: "all", label: language === "ar" ? "الكل" : "Toutes" },
    { key: "unresolved", label: language === "ar" ? "غير معالجة" : "Non traitées" },
    { key: "resolved", label: language === "ar" ? "معالجة" : "Traitées" },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/family/patients/${id}`} className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            {language === "ar" ? "التنبيهات" : "Alertes"}
          </h1>
          {patientName && <p className="text-sm text-text-muted">{patientName}</p>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-bg p-1 rounded-2xl">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${filter === key ? "bg-white text-text shadow-xs" : "text-text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <p className="text-text-muted font-bold">{language === "ar" ? "لا توجد تنبيهات." : "Aucune alerte."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={`rounded-2xl border p-4 space-y-3 ${SEVERITY_STYLE[a.severity] || "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm">{a.title}</p>
                    <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{a.description}</p>
                  </div>
                </div>
                {!a.isResolved && (
                  <button
                    type="button"
                    onClick={() => handleResolve(a.id)}
                    className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white transition-colors border border-current/20"
                  >
                    {language === "ar" ? "تحديد كـ تمت المعالجة" : "Marquer comme traitée"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-70">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(a.createdAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR")}
                  {" — "}
                  {new Date(a.createdAt).toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={`ml-auto px-2 py-0.5 rounded-full font-extrabold text-[10px] ${a.isResolved ? "bg-white/60" : "bg-white/60 animate-pulse"}`}>
                  {a.isResolved ? (language === "ar" ? "معالجة" : "Traitée") : (language === "ar" ? "غير معالجة" : "Non traitée")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
