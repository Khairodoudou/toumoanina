"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Smile, Check, Loader2, Heart, ArrowRight, ArrowLeft,
  Clock, CheckCircle2, Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface MoodItem {
  value: "very_good" | "good" | "neutral" | "difficult";
  labelFr: string;
  labelAr: string;
  descFr: string;
  descAr: string;
  emoji: string;
  color: string;
  activeColor: string;
}

const MOODS: MoodItem[] = [
  {
    value: "very_good",
    labelFr: "Très bien",
    labelAr: "ممتاز جداً",
    descFr: "Plein d'énergie et de joie",
    descAr: "طاقة وسعادة وراحة تامة",
    emoji: "😄",
    color: "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100",
    activeColor: "bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-300",
  },
  {
    value: "good",
    labelFr: "Bien",
    labelAr: "بخير",
    descFr: "Calme, serein et reposé",
    descAr: "هدوء واسترخاء وراحة بال",
    emoji: "😊",
    color: "bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100",
    activeColor: "bg-[#63C7B2] border-[#4AAA97] text-white ring-4 ring-teal-300",
  },
  {
    value: "neutral",
    labelFr: "Normal",
    labelAr: "عادي",
    descFr: "Journée paisible, sans souci",
    descAr: "يوم هادئ ومستقر",
    emoji: "😐",
    color: "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100",
    activeColor: "bg-amber-500 border-amber-600 text-white ring-4 ring-amber-300",
  },
  {
    value: "difficult",
    labelFr: "Pas très bien",
    labelAr: "لست بخير",
    descFr: "Un peu fatigué ou anxieux",
    descAr: "بعض التعب أو القلق",
    emoji: "😔",
    color: "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100",
    activeColor: "bg-rose-500 border-rose-600 text-white ring-4 ring-rose-300",
  },
];

export default function PatientMoodPage() {
  const { language, isRTL } = useI18n();
  const isAr = language === "ar";
  const router = useRouter();

  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastRecordedAt, setLastRecordedAt] = useState<string | null>(null);

  // Load patient and previous mood
  const loadData = useCallback(async () => {
    try {
      const localActiveId = typeof window !== "undefined" ? localStorage.getItem("toumoanina_active_patient_id") : null;

      const [authRes, patientsRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ user: null })),
        fetch("/api/patients", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ patients: [] })),
      ]);

      const activeId = localActiveId || authRes?.user?.activePatientId;
      const pts = patientsRes?.patients || [];
      const current = (activeId ? pts.find((p: { id: string }) => p.id === activeId) : null) || pts[0] || null;

      if (current) {
        setPatientId(current.id);
        setPatientName(current.name);

        // Fetch existing moods for this patient
        const moodRes = await fetch(`/api/moods?patientId=${current.id}`);
        if (moodRes.ok) {
          const moodData = await moodRes.json();
          const latest = moodData.moods?.[0];
          if (latest) {
            setSelected(latest.mood);
            setLastRecordedAt(latest.recordedAt);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setInitLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelect = async (mood: "very_good" | "good" | "neutral" | "difficult") => {
    setSelected(mood);
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId || undefined,
          mood,
          notes: "",
          recordedBy: "patient",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastRecordedAt(data.mood?.recordedAt || new Date().toISOString());
        setSavedSuccess(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const BackIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 px-4">
      {/* Header Title */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-[#E8F6F1] flex items-center justify-center mx-auto text-[#63C7B2] shadow-xs">
          <Smile className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#243B36]">
          {isAr ? "كيف تشعر اليوم؟" : "Comment vous sentez-vous ?"}
        </h1>
        <p className="text-[#4A7065] text-sm sm:text-base max-w-sm mx-auto">
          {isAr
            ? `اضغط على الوجه الذي يعبر عن حالتك الآن يا ${patientName || "عزيزنا"}.`
            : "Touchez simplement l'option qui correspond à votre état d'esprit."}
        </p>
      </div>

      {/* Success Confirmation Toast */}
      {savedSuccess && (
        <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3.5 shadow-sm animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 text-start">
            <p className="font-extrabold text-sm sm:text-base">
              {isAr ? "تم تسجيل حالتك المزاجية بنجاح!" : "Votre humeur a été enregistrée."}
            </p>
            <p className="text-xs text-emerald-700/90 font-medium mt-0.5">
              {isAr ? "عائلتك ستتمكن من الاطمئنان عليك." : "Votre famille est informée de votre état."}
            </p>
          </div>
        </div>
      )}

      {/* Last Recorded Info (Persistent across refresh) */}
      {lastRecordedAt && (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#527970] bg-white rounded-2xl py-2.5 px-4 border border-[#D8EFE8] shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#63C7B2]" />
          <span>
            {isAr ? "آخر تسجيل محفوظ:" : "Dernier enregistrement :"}
          </span>
          <span className="font-bold text-[#243B36]">
            {new Date(lastRecordedAt).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            {new Date(lastRecordedAt).toLocaleTimeString(isAr ? "ar-DZ" : "fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {/* Mood Options - 4 Large Accessible Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {MOODS.map((m) => {
          const isSelected = selected === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => handleSelect(m.value)}
              disabled={loading}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition-all text-start flex items-center gap-4 cursor-pointer shadow-xs active:scale-[0.98] ${
                isSelected ? m.activeColor : m.color
              }`}
            >
              <span className="text-4xl sm:text-5xl flex-shrink-0 select-none">
                {m.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-black text-lg sm:text-xl leading-tight">
                    {isAr ? m.labelAr : m.labelFr}
                  </h3>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 leading-snug ${isSelected ? "opacity-90" : "opacity-75"}`}>
                  {isAr ? m.descAr : m.descFr}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation button back to Patient Dashboard */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => router.push("/patient")}
          className="w-full py-4 rounded-3xl bg-[#E8F6F1] hover:bg-[#D6EFE7] text-[#2A6559] font-extrabold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>{isAr ? "العودة للرئيسية" : "Retour à l'accueil"}</span>
          <BackIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
