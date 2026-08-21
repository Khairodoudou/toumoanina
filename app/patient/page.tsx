"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, Smile, Gamepad2, CheckCircle2,
  Clock, Calendar, Sparkles, Send, Loader2,
  Heart, Sun, Moon, User,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
  emergencyPhone?: string;
}

export default function PatientPage() {
  const { t, isRTL, language } = useI18n();

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isEvening, setIsEvening] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [locLoading, setLocLoading] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSuccess, setMoodSuccess] = useState(false);

  // Fetch active patient
  useEffect(() => {
    const localActiveId = typeof window !== "undefined" ? localStorage.getItem("toumoanina_active_patient_id") : null;

    Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ user: null })),
      fetch("/api/patients", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ patients: [] })),
    ]).then(([authData, patientsData]) => {
      const activeId = localActiveId || authData?.user?.activePatientId;
      const pts: Patient[] = patientsData?.patients || [];
      const current = (activeId ? pts.find((p) => p.id === activeId) : null) || pts[0] || null;
      setPatient(current);
    });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setIsEvening(now.getHours() >= 18 || now.getHours() < 6);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  // Handle send location
  const handleSendLocation = async () => {
    setLocLoading(true);
    setLocSuccess(false);

    let lat = 36.7538;
    let lng = 3.0588;

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 6000,
            enableHighAccuracy: true,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch {
        // Fallback default coordinates
      }
    }

    try {
      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient?.id,
          latitude: lat,
          longitude: lng,
          accuracy: 8,
          source: "patient-mode",
        }),
      });
      setLocSuccess(true);
      setTimeout(() => setLocSuccess(false), 5000);
    } catch {
      // ignore
    } finally {
      setLocLoading(false);
    }
  };

  // Handle Mood selection
  const handleMoodSelect = async (mood: "very_good" | "good" | "neutral" | "difficult") => {
    setSelectedMood(mood);
    setMoodSuccess(true);

    try {
      await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient?.id,
          mood,
          recordedBy: "patient",
        }),
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setMoodSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 my-auto w-full">

      {/* Date & Time Welcome Card with Patient Greeting */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-[#D8EFE8] shadow-sm text-center relative overflow-hidden">
        
        {/* Selected Patient Banner */}
        {patient && (
          <div className="inline-flex items-center gap-3 mb-3 sm:mb-4 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#E8F6F1] rounded-2xl border border-[#D8EFE8] shadow-2xs max-w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#63C7B2] bg-white flex items-center justify-center font-black text-sm sm:text-base text-[#2A6559] flex-shrink-0 shadow-xs">
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                patient.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-start leading-tight min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#527970] truncate">
                {language === "ar" ? "مرحباً بك، نتمنى لك يوماً طيباً" : "Bienvenue, belle journée"}
              </p>
              <h2 className="text-sm sm:text-lg font-black text-[#243B36] truncate">
                {patient.name}
              </h2>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2 text-[#4AAA97] font-bold text-xs sm:text-base">
          {isEvening ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
          <span>
            {isEvening ? t.patientView.greetingEvening : t.patientView.greetingMorning} !
          </span>
        </div>

        <div className="text-4xl sm:text-6xl md:text-7xl font-black text-[#243B36] tracking-tight my-1 sm:my-2 font-mono" dir="ltr">
          {currentTime || "--:--"}
        </div>

        <p className="text-xs sm:text-base md:text-lg font-semibold text-[#527970] capitalize">
          {t.patientView.todayIs} <span className="font-extrabold text-[#243B36]">{currentDate}</span>
        </p>
      </div>

      {/* Main Grid: Location & Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Send Location */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-[#D8EFE8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F6F1] text-[#4AAA97] flex items-center justify-center mb-3 sm:mb-4">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#243B36] mb-1.5 sm:mb-2">
              {t.patientView.btnLocation}
            </h2>
            <p className="text-xs sm:text-sm text-[#527970] mb-4 sm:mb-6 leading-relaxed">
              {t.patientView.btnLocationDesc}
            </p>
          </div>

          <div>
            {locSuccess ? (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{t.patientView.btnLocationSuccess}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendLocation}
                disabled={locLoading}
                className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-[#63C7B2] hover:bg-[#4AAA97] active:scale-[0.99] text-white font-black text-xs sm:text-base shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer"
              >
                {locLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>{t.patientView.btnLocationSending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{t.patientView.btnLocation}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Daily Mood Check-in */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-[#D8EFE8] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 sm:mb-4">
              <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#243B36] mb-1.5 sm:mb-2">
              {t.patientView.btnMoodTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#527970] mb-3 sm:mb-4 leading-relaxed">
              {language === "ar"
                ? "اختر الرمز الذي يعبر عن حالتك الآن"
                : "Touchez simplement l'émoticône qui correspond à votre état"}
            </p>
          </div>

          <div>
            {moodSuccess ? (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{t.patientView.moodThanks}</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { key: "good", emoji: "😊", label: language === "ar" ? "ممتاز" : "Très bien", bg: "hover:bg-emerald-50 border-emerald-200" },
                  { key: "neutral", emoji: "😐", label: language === "ar" ? "عادي" : "Calme", bg: "hover:bg-amber-50 border-amber-200" },
                  { key: "difficult", emoji: "😔", label: language === "ar" ? "متعب" : "Fatigué", bg: "hover:bg-rose-50 border-rose-200" },
                ].map(({ key, emoji, label, bg }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleMoodSelect(key as "good" | "neutral" | "difficult")}
                    className={`flex flex-col items-center gap-1 p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer ${bg} ${
                      selectedMood === key ? "border-[#63C7B2] bg-[#E8F6F1]" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl sm:text-4xl select-none">{emoji}</span>
                    <span className="text-[10px] sm:text-xs font-black text-[#243B36]">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Memory Games Launch banner */}
      <div className="bg-gradient-to-r from-[#63C7B2] to-[#8CC8E8] rounded-3xl p-5 sm:p-7 md:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-black">{t.patientView.btnGamesTitle}</h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5 sm:mt-1">
              {t.patientView.btnGamesDesc}
            </p>
          </div>
        </div>

        <Link
          href="/patient/activities"
          className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white text-[#2A6559] hover:bg-white/90 active:scale-95 font-black text-xs sm:text-base shadow-sm transition-all text-center flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <span>{t.activities.btnLaunchGame}</span>
        </Link>
      </div>
    </div>
  );
}
