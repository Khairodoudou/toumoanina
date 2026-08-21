"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Activity, Loader2, Clock, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ActivityRecord {
  id: string;
  activityType: string;
  score: number;
  turns: number;
  durationSeconds: number;
  completedAt: string;
}

interface ActivityTemplate {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: string;
  difficulty: string;
  durationMinutes: number;
  isActive: boolean;
}

const DIFF_STYLE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};
const DIFF_LABEL: Record<string, { fr: string; ar: string }> = {
  easy: { fr: "Facile", ar: "سهل" },
  medium: { fr: "Moyen", ar: "متوسط" },
  hard: { fr: "Difficile", ar: "صعب" },
};

export default function PatientActivitiesPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const [tab, setTab] = useState<"available" | "history">("history");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, actRes, tplRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/activities?patientId=${id}`),
        fetch("/api/admin/activity-templates"),
      ]);
      if (patRes.ok) { const d = await patRes.json(); setPatientName(d.patient?.name || ""); }
      if (actRes.ok) { const d = await actRes.json(); setActivities(d.activities || []); }
      if (tplRes.ok) { const d = await tplRes.json(); setTemplates((d.templates || []).filter((t: ActivityTemplate) => t.isActive)); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const typeLabel = (type: string) => {
    const map: Record<string, { fr: string; ar: string }> = {
      memory_pairs: { fr: "Jeu des paires", ar: "لعبة الأزواج" },
      photo_memory: { fr: "Reconnaissance de photos", ar: "التعرف على الصور" },
      daily_puzzle: { fr: "Puzzle quotidien", ar: "الأحجية اليومية" },
    };
    return map[type]?.[language as "fr" | "ar"] || type;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/family/patients/${id}`} className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            {language === "ar" ? "الأنشطة المعرفية" : "Activités cognitives"}
          </h1>
          {patientName && <p className="text-sm text-text-muted">{patientName}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-bg p-1 rounded-2xl">
        {[
          { key: "history", label: language === "ar" ? "التاريخ" : "Réalisées" },
          { key: "available", label: language === "ar" ? "المتاحة" : "Disponibles" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as "available" | "history")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === key ? "bg-white text-text shadow-xs" : "text-text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : tab === "available" ? (
        <div className="space-y-3">
          {templates.length === 0 ? (
            <p className="text-center text-text-muted py-12">{language === "ar" ? "لا توجد أنشطة متاحة." : "Aucune activité disponible."}</p>
          ) : templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-border/60 card-shadow p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-text">{language === "ar" ? t.titleAr : t.titleFr}</p>
                  <p className="text-xs text-text-muted mt-0.5">{language === "ar" ? t.descriptionAr : t.descriptionFr}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full border flex-shrink-0 ${DIFF_STYLE[t.difficulty] || ""}`}>
                  {DIFF_LABEL[t.difficulty]?.[language as "fr" | "ar"] || t.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.durationMinutes} min</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-text-muted text-center italic">
            {language === "ar"
              ? "يمكن للمريض القيام بهذه الأنشطة من وضع المريض."
              : "Ces activités peuvent être réalisées depuis le Mode Patient."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Activity className="w-12 h-12 text-text-muted/40 mx-auto" />
              <p className="text-text-muted font-bold">{language === "ar" ? "لم يتم القيام بأي نشاط بعد." : "Aucune activité réalisée."}</p>
            </div>
          ) : activities.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-border/60 card-shadow p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-text">{typeLabel(a.activityType)}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(a.completedAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>{a.score}%</span>
                  </div>
                  <p className="text-xs text-text-muted">{Math.round(a.durationSeconds / 60)} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
