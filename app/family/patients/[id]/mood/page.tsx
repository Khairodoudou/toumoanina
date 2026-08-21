"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Smile, Loader2, TrendingUp,
  Clock, User, Users2, Calendar,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface MoodRecord {
  id: string;
  mood: "very_good" | "good" | "neutral" | "difficult";
  notes?: string;
  recordedAt: string;
  recordedBy: "patient" | "caregiver";
}

const MOOD_CONFIG = {
  very_good: {
    labelFr: "Très bien",
    labelAr: "ممتاز جداً",
    emoji: "😄",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  good: {
    labelFr: "Bien",
    labelAr: "بخير",
    emoji: "😊",
    color: "bg-teal-50 text-teal-800 border-teal-200",
    dot: "bg-[#63C7B2]",
  },
  neutral: {
    labelFr: "Normal",
    labelAr: "عادي",
    emoji: "😐",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-400",
  },
  difficult: {
    labelFr: "Pas très bien",
    labelAr: "لست بخير",
    emoji: "😔",
    color: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
};

function formatDateTime(dateStr: string, isAr: boolean) {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(isAr ? "ar-DZ" : "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function PatientMoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const isAr = language === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, moodRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/moods?patientId=${id}`),
      ]);
      if (patRes.ok) {
        const d = await patRes.json();
        setPatientName(d.patient?.name || "");
      }
      if (moodRes.ok) {
        const d = await moodRes.json();
        setMoods(d.moods || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = moods.length;
  const counts = {
    very_good: moods.filter((m) => m.mood === "very_good").length,
    good: moods.filter((m) => m.mood === "good").length,
    neutral: moods.filter((m) => m.mood === "neutral").length,
    difficult: moods.filter((m) => m.mood === "difficult").length,
  };

  const latestMood = moods[0] || null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/family/patients/${id}`}
          className="p-2 rounded-xl hover:bg-bg transition-colors"
        >
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <Smile className="w-6 h-6 text-primary" />
            <span>{isAr ? "الحالة المزاجية للقريب" : "Suivi de l'humeur"}</span>
          </h1>
          {patientName && (
            <p className="text-sm font-semibold text-primary mt-0.5">{patientName}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Latest Mood Banner */}
          {latestMood && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/60 card-shadow flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl flex-shrink-0 select-none">
                {MOOD_CONFIG[latestMood.mood]?.emoji || "😊"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                  {isAr ? "آخر حالة مزاجية مسجلة" : "Humeur récente"}
                </span>
                <h2 className="text-xl font-black text-text leading-tight">
                  {isAr
                    ? MOOD_CONFIG[latestMood.mood]?.labelAr
                    : MOOD_CONFIG[latestMood.mood]?.labelFr}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {formatDateTime(latestMood.recordedAt, isAr).date} · {formatDateTime(latestMood.recordedAt, isAr).time}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-primary">
                    {latestMood.recordedBy === "patient"
                      ? (isAr ? "سجّله المريض" : "Par le patient")
                      : (isAr ? "سجّله المرافق" : "Par l'aidant")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          {total > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-text flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>{isAr ? "إحصائيات الحالة المزاجية" : "Statistiques de l'humeur"}</span>
                </h2>
                <span className="text-xs font-bold text-text-muted">
                  {total} {isAr ? "تسجيلات" : "relevés"}
                </span>
              </div>

              <div className="space-y-2.5">
                {(["very_good", "good", "neutral", "difficult"] as const).map((mKey) => {
                  const cfg = MOOD_CONFIG[mKey];
                  const count = counts[mKey];
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={mKey} className="flex items-center gap-3 text-xs">
                      <span className="text-xl w-6 text-center select-none">{cfg.emoji}</span>
                      <span className="font-bold text-text w-24 flex-shrink-0">
                        {isAr ? cfg.labelAr : cfg.labelFr}
                      </span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cfg.dot}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-text w-6 text-end">
                        {count}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted w-8 text-end">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-text-muted italic pt-2 border-t border-border/40">
                {isAr
                  ? "هذا ليس تحليلاً طبياً، بل هو سجل لمتابعة راحة القريب النفسية واليومية."
                  : "Ce n'est pas une analyse médicale. Uniquement un historique de suivi du bien-être."}
              </p>
            </div>
          )}

          {/* History */}
          {moods.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl p-8 border border-border/50">
              <Smile className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
              <p className="text-text-muted font-bold">
                {isAr ? "لا توجد تسجيلات للحالة المزاجية بعد." : "Aucun enregistrement d'humeur."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="font-extrabold text-text text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{isAr ? "السجل الزمني للمزاج" : "Historique chronologique"}</span>
              </h2>

              <div className="space-y-2.5">
                {moods.map((m) => {
                  const cfg = MOOD_CONFIG[m.mood] || MOOD_CONFIG.neutral;
                  const formatted = formatDateTime(m.recordedAt, isAr);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl border p-4 flex items-start gap-3.5 transition-all ${cfg.color}`}
                    >
                      <span className="text-3xl flex-shrink-0 select-none">
                        {cfg.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">
                              {isAr ? cfg.labelAr : cfg.labelFr}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 shadow-2xs">
                              {m.recordedBy === "patient"
                                ? (isAr ? "سجّله المريض" : "Par le patient")
                                : (isAr ? "سجّله المرافق" : "Par l'aidant")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs opacity-75 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{formatted.date}</span>
                            <span>·</span>
                            <span>{formatted.time}</span>
                          </div>
                        </div>
                        {m.notes && (
                          <p className="text-xs opacity-90 mt-1 leading-relaxed bg-white/60 p-2 rounded-xl">
                            {m.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
