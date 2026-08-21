"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, History, Loader2, MapPin, Smile, Activity, Bell } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface TimelineEvent {
  id: string;
  type: "location" | "mood" | "activity" | "alert";
  text: string;
  at: string;
}

type FilterType = "all" | "location" | "mood" | "activity" | "alert";

const TYPE_CONFIG = {
  location: { icon: MapPin, color: "text-blue-600 bg-blue-50 border-blue-200", label: { fr: "Localisation", ar: "الموقع" } },
  mood: { icon: Smile, color: "text-amber-600 bg-amber-50 border-amber-200", label: { fr: "Humeur", ar: "الحالة المزاجية" } },
  activity: { icon: Activity, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: { fr: "Activité", ar: "نشاط" } },
  alert: { icon: Bell, color: "text-red-600 bg-red-50 border-red-200", label: { fr: "Alerte", ar: "تنبيه" } },
};

export default function PatientHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [patientName, setPatientName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, locRes, moodRes, actRes, altRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/locations?patientId=${id}`),
        fetch(`/api/moods?patientId=${id}`),
        fetch(`/api/activities?patientId=${id}`),
        fetch(`/api/alerts?patientId=${id}`),
      ]);

      if (patRes.ok) { const d = await patRes.json(); setPatientName(d.patient?.name || ""); }

      const all: TimelineEvent[] = [];

      if (locRes.ok) {
        const d = await locRes.json();
        (d.locations || []).forEach((l: { id: string; recordedAt: string; isInsideSafeZone: boolean }) => {
          all.push({
            id: `loc_${l.id}`, type: "location",
            text: l.isInsideSafeZone
              ? (language === "ar" ? "الموقع محدّث — داخل منطقة الأمان" : "Localisation mise à jour — Dans la zone de sécurité")
              : (language === "ar" ? "الموقع محدّث — خارج منطقة الأمان" : "Localisation mise à jour — Hors de la zone"),
            at: l.recordedAt,
          });
        });
      }

      if (moodRes.ok) {
        const d = await moodRes.json();
        const moodLabel: Record<string, { fr: string; ar: string }> = {
          good: { fr: "Serein", ar: "مبتهج" }, neutral: { fr: "Calme", ar: "هادئ" }, difficult: { fr: "Difficile", ar: "صعب" },
        };
        (d.moods || []).forEach((m: { id: string; mood: string; recordedAt: string }) => {
          all.push({
            id: `mood_${m.id}`, type: "mood",
            text: `${language === "ar" ? "تسجيل الحالة المزاجية: " : "Humeur enregistrée : "}${moodLabel[m.mood]?.[language as "fr" | "ar"] || m.mood}`,
            at: m.recordedAt,
          });
        });
      }

      if (actRes.ok) {
        const d = await actRes.json();
        (d.activities || []).forEach((a: { id: string; activityType: string; score: number; completedAt: string }) => {
          all.push({
            id: `act_${a.id}`, type: "activity",
            text: `${language === "ar" ? "نشاط مكتمل" : "Activité réalisée"} — ${a.activityType} (${a.score}%)`,
            at: a.completedAt,
          });
        });
      }

      if (altRes.ok) {
        const d = await altRes.json();
        (d.alerts || []).forEach((a: { id: string; title: string; createdAt: string }) => {
          all.push({ id: `alt_${a.id}`, type: "alert", text: a.title, at: a.createdAt });
        });
      }

      all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setEvents(all);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id, language]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  const FILTER_TABS: { key: FilterType; label: string }[] = [
    { key: "all", label: language === "ar" ? "الكل" : "Tous" },
    { key: "location", label: language === "ar" ? "الموقع" : "Localisation" },
    { key: "mood", label: language === "ar" ? "الحالة" : "Humeur" },
    { key: "activity", label: language === "ar" ? "الأنشطة" : "Activités" },
    { key: "alert", label: language === "ar" ? "التنبيهات" : "Alertes" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/family/patients/${id}`} className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            {language === "ar" ? "السجل الزمني" : "Historique"}
          </h1>
          {patientName && <p className="text-sm text-text-muted">{patientName}</p>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === key ? "bg-slate-900 text-white" : "bg-bg text-text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
          <p className="text-text-muted font-bold">{language === "ar" ? "لا توجد أحداث." : "Aucun événement."}</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute ltr:left-5 rtl:right-5 top-0 bottom-0 w-px bg-border/60" />
          {filtered.map((e) => {
            const cfg = TYPE_CONFIG[e.type];
            const Icon = cfg.icon;
            return (
              <div key={e.id} className="relative flex items-start gap-4 pb-5">
                <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-border/60 p-4 card-shadow">
                  <p className="font-bold text-sm text-text">{e.text}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(e.at).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {" — "}
                    {new Date(e.at).toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
