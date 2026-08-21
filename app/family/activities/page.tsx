"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gamepad2, Clock, Target, Trophy, Loader2, TrendingUp,
  Calendar, Check, Users2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ActivityRecord {
  id: string;
  activityType: string;
  turns: number;
  durationSeconds: number;
  score?: number;
  difficulty?: string;
  completedAt: string;
  patientId: string;
}

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  memory_pairs:    "🃏",
  photo_memory:    "🖼️",
  number_sequence: "🔢",
  color_quiz:      "🎨",
  math_easy:       "➕",
  word_match:      "🔗",
  "memory-cards":  "🃏",
  "word-association": "💬",
  "daily-routine": "📅",
  "color-name":    "🎨",
  "number-sequence": "🔢",
};

const ACTIVITY_LABELS_FR: Record<string, string> = {
  memory_pairs:    "Jeu des paires de mémoire",
  photo_memory:    "Reconnaissance de photos & souvenirs",
  number_sequence: "Suite de chiffres",
  color_quiz:      "Quiz de couleurs & réflexes",
  math_easy:       "Calcul mental facile",
  word_match:      "Association d'objets du quotidien",
  "memory-cards":  "Cartes Mémoire",
  "word-association": "Association de Mots",
  "daily-routine": "Routine Quotidienne",
  "color-name":    "Couleurs & Noms",
  "number-sequence": "Séquences Numériques",
};

const ACTIVITY_LABELS_AR: Record<string, string> = {
  memory_pairs:    "لعبة أزواج الذاكرة",
  photo_memory:    "التعرف على الصور والذكريات",
  number_sequence: "تسلسل الأرقام",
  color_quiz:      "اختبار الألوان والتركيز",
  math_easy:       "الحساب الذهني البسيط",
  word_match:      "مطابقة الأشياء المترابطة",
  "memory-cards":  "بطاقات الذاكرة",
  "word-association": "تداعي الكلمات",
  "daily-routine": "الروتين اليومي",
  "color-name":    "الألوان والأسماء",
  "number-sequence": "تسلسل الأرقام",
};

function formatDuration(seconds: number, lang: string) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (lang === "ar") return `${m} د ${s} ث`;
  return `${m}min ${s}s`;
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return lang === "ar" ? "الآن" : "À l'instant";
  if (diff < 3600) return lang === "ar" ? `${Math.floor(diff / 60)} د` : `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return lang === "ar" ? `${Math.floor(diff / 3600)} س` : `${Math.floor(diff / 3600)}h`;
  return lang === "ar" ? `${Math.floor(diff / 86400)} يوم` : `${Math.floor(diff / 86400)}j`;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ActivitiesPage() {
  const { t, language, isRTL } = useI18n();
  const isAr = language === "ar";
  const ACTIVITY_LABELS = isAr ? ACTIVITY_LABELS_AR : ACTIVITY_LABELS_FR;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async (pid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activities?patientId=${pid}`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [pRes, meRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/auth/me"),
        ]);
        const pData = await pRes.json();
        const meData = await meRes.json();

        const pts: Patient[] = pData.patients || [];
        setPatients(pts);

        const activeId = meData.user?.activePatientId;
        const initial = pts.find((p) => p.id === activeId) || pts[0] || null;
        setSelectedPatient(initial);
        if (initial) fetchActivities(initial.id);
      } catch {
        setLoading(false);
      }
    };
    init();
  }, [fetchActivities]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    fetchActivities(p.id);
  };

  // Stats
  const totalSessions = activities.length;
  const totalMinutes = Math.floor(activities.reduce((a, b) => a + b.durationSeconds, 0) / 60);
  const bestScore = activities.reduce((best, a) => (a.score || 0) > best ? (a.score || 0) : best, 0);
  const avgScore = totalSessions > 0
    ? Math.round(activities.reduce((sum, a) => sum + (a.score || 0), 0) / totalSessions)
    : 0;

  const byType: Record<string, number> = {};
  activities.forEach((a) => { byType[a.activityType] = (byType[a.activityType] || 0) + 1; });
  const mostPlayed = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text">{t.activities.title}</h1>
        <p className="text-sm text-text-muted mt-1">{t.activities.subtitle}</p>
      </div>

      {/* ── Patient Switcher ── */}
      {patients.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-extrabold text-text">
              {isAr ? "اختيار القريب" : "Choisir un proche"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {patients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPatient(p)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer
                    ${isSelected
                      ? "bg-gradient-to-r from-primary/20 to-secondary/10 border-primary/40 shadow-sm"
                      : "bg-bg border-border/60 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-xs font-extrabold">
                        {getInitials(p.name)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={`text-${isRTL ? "right" : "left"} min-w-0`}>
                    <p className="text-sm font-extrabold text-text leading-tight">{p.name}</p>
                    <p className="text-[11px] text-text-muted">
                      {isAr ? "سجل الأنشطة" : "Historique activités"}
                    </p>
                  </div>

                  {/* Check badge */}
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full ms-1 flex-shrink-0">
                      <Check className="w-3 h-3" />
                      {isAr ? "محدد" : "Sélectionné"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Gamepad2, label: t.activities.statSessions, value: totalSessions, color: "bg-primary/10 text-primary" },
          { icon: Target, label: isAr ? "متوسط النقاط" : "Score moyen", value: avgScore > 0 ? `${avgScore}%` : "—", color: "bg-secondary/10 text-secondary" },
          { icon: Clock, label: t.activities.statTotalTime, value: `${totalMinutes}min`, color: "bg-amber-50 text-amber-700" },
          { icon: Trophy, label: t.activities.statBestScore, value: bestScore > 0 ? `${bestScore}%` : "—", color: "bg-emerald-50 text-emerald-700" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 border border-border/50 card-shadow flex items-start gap-3 ${color}`}>
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold opacity-70 mb-0.5 leading-tight">{label}</p>
              <p className="text-lg font-extrabold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Most Played */}
      {mostPlayed && (
        <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-2xl flex-shrink-0">
              {ACTIVITY_ICONS[mostPlayed] || "🎮"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">{t.activities.mostPlayedLabel}</p>
              <p className="text-sm font-extrabold text-text">{ACTIVITY_LABELS[mostPlayed] || mostPlayed}</p>
              <p className="text-[11px] text-primary font-semibold">
                {byType[mostPlayed]} {isAr ? "جلسة" : "session(s)"}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Activity History */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow">
        <h2 className="text-sm font-extrabold text-text mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {t.activities.historyTitle}
          {selectedPatient && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {selectedPatient.name}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-10 h-10 text-text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-text-muted font-bold">{t.activities.emptyState}</p>
            <p className="text-xs text-text-muted mt-2">{t.activities.emptyStateHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const scoreColor =
                (a.score || 0) >= 80 ? "text-emerald-600 bg-emerald-50"
                : (a.score || 0) >= 50 ? "text-amber-600 bg-amber-50"
                : "text-red-500 bg-red-50";

              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-2xl border border-border/50 bg-bg hover:bg-primary/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-border/60 flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
                    {ACTIVITY_ICONS[a.activityType] || "🎮"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text truncate">
                      {ACTIVITY_LABELS[a.activityType] || a.activityType}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[10px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        {a.turns} {isAr ? "محاولة" : "essais"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDuration(a.durationSeconds, language)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {a.score !== undefined && a.score > 0 && (
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${scoreColor}`}>
                        {a.score}%
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted font-mono">
                      {timeAgo(a.completedAt, language)}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(a.completedAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/8 border border-primary/15">
        <Gamepad2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-text mb-0.5">{t.activities.hintTitle}</p>
          <p className="text-xs text-text-muted">{t.activities.hintDesc}</p>
        </div>
      </div>
    </div>
  );
}
