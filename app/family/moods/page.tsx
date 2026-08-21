"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Smile, Plus, X, Save, Loader2, AlertTriangle,
  Clock, User, Users2, Users, Check, TrendingUp,
  HeartHandshake, Calendar,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
}

interface MoodRecord {
  id: string;
  patientId: string;
  mood: "very_good" | "good" | "neutral" | "difficult";
  notes?: string;
  recordedBy: "patient" | "caregiver";
  recordedAt: string;
}

const MOOD_CONFIG = {
  very_good: {
    labelFr: "Très bien",
    labelAr: "ممتاز جداً",
    emoji: "😄",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    barColor: "bg-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800",
  },
  good: {
    labelFr: "Bien",
    labelAr: "بخير",
    emoji: "😊",
    color: "bg-teal-50 border-teal-200 text-teal-800",
    barColor: "bg-[#63C7B2]",
    badgeBg: "bg-teal-100 text-teal-800",
  },
  neutral: {
    labelFr: "Normal",
    labelAr: "عادي",
    emoji: "😐",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    barColor: "bg-amber-400",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  difficult: {
    labelFr: "Pas très bien",
    labelAr: "لست بخير",
    emoji: "😔",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    barColor: "bg-rose-500",
    badgeBg: "bg-rose-100 text-rose-800",
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

export default function MoodsPage() {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<"very_good" | "good" | "neutral" | "difficult" | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = useCallback(async (patient: Patient | null) => {
    if (!patient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/moods?patientId=${patient.id}`);
      const data = await res.json();
      setMoods(data.moods || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({ user: null })),
    ]).then(([patientsData, authData]) => {
      const pts: Patient[] = patientsData.patients || [];
      setPatients(pts);
      const savedActiveId = authData?.user?.activePatientId;
      const target = pts.find((p) => p.id === savedActiveId) || pts[0] || null;
      setActivePatient(target);
      fetchMoods(target);
    });
  }, [fetchMoods]);

  const switchPatient = (p: Patient) => {
    if (activePatient?.id === p.id) return;
    setActivePatient(p);
    fetchMoods(p);
    fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activePatientId: p.id }),
    }).catch(() => {});
  };

  const handleSave = async () => {
    if (!selectedMood) {
      setError(isAr ? "يرجى اختيار الحالة المزاجية." : "Veuillez sélectionner un état d'humeur.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: activePatient?.id,
          mood: selectedMood,
          notes: notes.trim(),
          recordedBy: "caregiver",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'enregistrement.");
        return;
      }
      setModalOpen(false);
      setSelectedMood(null);
      setNotes("");
      await fetchMoods(activePatient);
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const total = moods.length;
  const counts = {
    very_good: moods.filter((m) => m.mood === "very_good").length,
    good: moods.filter((m) => m.mood === "good").length,
    neutral: moods.filter((m) => m.mood === "neutral").length,
    difficult: moods.filter((m) => m.mood === "difficult").length,
  };

  const latestMood = moods[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {t.moods.title}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t.moods.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setModalOpen(true); setError(null); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-brand text-white text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.moods.btnLogMood}</span>
        </button>
      </div>

      {/* ── Patient Switcher (if multiple) ───────────────── */}
      {patients.length > 1 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-border/50 card-shadow">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-extrabold text-text">
                {isAr ? "اختيار المريض لمتابعة المزاج" : "Sélectionner le proche"}
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {patients.length} {isAr ? "مرضى" : "proches"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {patients.map((p) => {
              const isSelected = activePatient?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchPatient(p)}
                  className={`p-3 rounded-2xl border text-start transition-all flex items-center gap-3 relative cursor-pointer ${
                    isSelected
                      ? "bg-gradient-brand text-white border-transparent shadow-md shadow-primary/25 ring-2 ring-primary/40"
                      : "bg-slate-50/80 text-text border-border hover:border-primary/40 hover:bg-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 flex items-center justify-center font-bold text-sm ${
                    isSelected
                      ? "border-white/80 bg-white/20 text-white shadow-inner"
                      : "border-primary/20 bg-primary/10 text-primary"
                  }`}>
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold truncate ${isSelected ? "text-white" : "text-text"}`}>
                        {p.name}
                      </p>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          {isAr ? "محدد" : "Actif"}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-text-muted"}`}>
                      {isAr ? "سجل الحالة المزاجية" : "Suivi du bien-être"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── KPI & Summary Cards ──────────────────────────── */}
      {latestMood && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Latest Mood Card */}
          <div className="sm:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 ${
              MOOD_CONFIG[latestMood.mood]?.badgeBg || "bg-slate-100"
            }`}>
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
                    : (isAr ? "سجّلته العائلة" : "Par l'aidant")}
                </span>
              </div>
            </div>
          </div>

          {/* Total logs count */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-muted">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "إجمالي التسجيلات" : "Total relevés"}
              </span>
            </div>
            <p className="text-3xl font-black text-text my-2">
              {total}
            </p>
            <p className="text-[11px] text-text-muted">
              {isAr
                ? `ملاحظات مسجلة للمريض ${activePatient?.name || ""}`
                : `Enregistrements pour ${activePatient?.name || "le proche"}`}
            </p>
          </div>
        </div>
      )}

      {/* ── Mood Distribution Bar Chart ──────────────────── */}
      {total > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>{t.moods.chartTitle}</span>
            </h2>
            <span className="text-xs font-bold text-text-muted">
              {total} {isAr ? "تسجيل" : "relevés"}
            </span>
          </div>

          <div className="space-y-3">
            {(["very_good", "good", "neutral", "difficult"] as const).map((moodKey) => {
              const cfg = MOOD_CONFIG[moodKey];
              const count = counts[moodKey];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={moodKey} className="flex items-center gap-3 text-xs">
                  <span className="text-2xl w-8 text-center flex-shrink-0 select-none">
                    {cfg.emoji}
                  </span>
                  <span className="font-bold text-text w-24 flex-shrink-0">
                    {isAr ? cfg.labelAr : cfg.labelFr}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-text w-8 text-end">
                    {count}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono w-10 text-end">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Chronological Mood History ───────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow space-y-4">
        <h2 className="text-sm font-extrabold text-text flex items-center gap-2">
          <Smile className="w-4 h-4 text-primary" />
          <span>{t.moods.historyTitle}</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : moods.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-border flex items-center justify-center mx-auto text-text-muted">
              <Smile className="w-7 h-7 opacity-50" />
            </div>
            <p className="text-sm font-bold text-text">
              {t.moods.emptyMoods}
            </p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {isAr
                ? "يمكن للمريض تسجيل مزاجه من وضعه الخاص، أو يمكنك تسجيل ملاحظة جديدة عبر الزر بالأعلى."
                : "Le patient peut enregistrer son humeur depuis le mode patient, ou vous pouvez ajouter une note."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {moods.map((m) => {
              const cfg = MOOD_CONFIG[m.mood] || MOOD_CONFIG.neutral;
              const formatted = formatDateTime(m.recordedAt, isAr);
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl p-4 border flex items-start gap-4 transition-all ${cfg.color}`}
                >
                  <span className="text-3xl flex-shrink-0 select-none">
                    {cfg.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">
                          {isAr ? cfg.labelAr : cfg.labelFr}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 shadow-2xs">
                          {m.recordedBy === "patient"
                            ? (isAr ? "سجّله المريض" : "Par le patient")
                            : (isAr ? "سجّلته العائلة" : "Par l'aidant")}
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
        )}
      </div>

      {/* ── Log Mood Modal (4 Choices) ───────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md card-shadow animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-text">
                {t.moods.modalLogTitle}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-text-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              {t.moods.fieldMoodSelect}
            </p>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {(["very_good", "good", "neutral", "difficult"] as const).map((mKey) => {
                const cfg = MOOD_CONFIG[mKey];
                const isSelected = selectedMood === mKey;
                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => setSelectedMood(mKey)}
                    className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition-all text-start cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                        : "border-border bg-slate-50/70 hover:border-primary/40 hover:bg-white"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0 select-none">
                      {cfg.emoji}
                    </span>
                    <span className="text-xs font-extrabold text-text leading-tight">
                      {isAr ? cfg.labelAr : cfg.labelFr}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-text mb-1.5 block">
                {t.moods.fieldNotes}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? "أدخل أي سياق أو ملاحظات إضافية..." : "Ajoutez des notes ou le contexte..."}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-border text-text text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-border text-xs font-bold text-text-muted hover:bg-slate-50 cursor-pointer"
              >
                {isAr ? "إلغاء" : "Annuler"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedMood}
                className="flex-1 py-3 rounded-xl bg-gradient-brand text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-primary/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t.moods.btnSubmit}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
