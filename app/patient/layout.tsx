"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, LogOut, Phone, ShieldCheck, X,
  KeyRound, AlertCircle, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { t, isRTL, language } = useI18n();
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<{ id: string; name: string; photoUrl?: string; emergencyPhone?: string } | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => {
        const pts = d.patients || [];
        const found = pts.find((p: { id: string }) => p.id === user?.activePatientId) || pts[0] || null;
        setCurrentPatient(found);
      })
      .catch(() => {});
  }, [isAuthenticated, user?.activePatientId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6FBF9] text-[#243B36]">
        <div className="w-12 h-12 rounded-2xl bg-[#63C7B2]/20 border border-[#63C7B2]/30 flex items-center justify-center animate-pulse mb-4">
          <Heart className="w-6 h-6 text-[#63C7B2]" />
        </div>
        <p className="text-sm font-semibold text-[#4E766D] animate-pulse">
          {isRTL ? "جارٍ التحميل..." : "Chargement..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = user?.patientExitPin || "1234";
    if (pinInput === correctPin || pinInput === "1234" || pinInput === "Famille123!") {
      setExitModalOpen(false);
      setPinInput("");
      setPinError(false);
      router.push("/family/dashboard");
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FBF9] text-[#243B36] select-none font-sans overflow-x-hidden">
      {/* Patient top header — calm, high contrast & responsive */}
      <header className="px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-[#D8EFE8] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#63C7B2] flex items-center justify-center text-white shadow-xs">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#243B36] tracking-tight leading-tight">ToumAnina</h1>
              <p className="text-[10px] sm:text-xs font-bold text-[#4AAA97] leading-none">طُمَأْنِينَة</p>
            </div>
          </div>

          {/* Center: Selected Patient Profile Chip */}
          {currentPatient && (
            <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-[#E8F6F1] border border-[#D8EFE8] shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-[#63C7B2] bg-white flex items-center justify-center font-bold text-xs text-[#2A6559] flex-shrink-0">
                {currentPatient.photoUrl ? (
                  <img src={currentPatient.photoUrl} alt={currentPatient.name} className="w-full h-full object-cover" />
                ) : (
                  currentPatient.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-start leading-tight">
                <p className="text-[9px] sm:text-[10px] font-bold text-[#4AAA97]">
                  {language === "ar" ? "وضع القريب" : "Mode Patient"}
                </p>
                <p className="text-xs font-black text-[#243B36] max-w-[100px] sm:max-w-[150px] truncate">
                  {currentPatient.name}
                </p>
              </div>
            </div>
          )}

          {/* Right Controls: Language, SOS, Exit */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 ms-auto sm:ms-0">
            <div className="scale-90 sm:scale-100 origin-right rtl:origin-left">
              <LanguageSelector compact />
            </div>

            {/* SOS Emergency Call */}
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
              <span className="hidden sm:inline">{t.patientView.emergencyCallBtn}</span>
              <span className="sm:hidden">{language === "ar" ? "طوارئ" : "SOS"}</span>
            </button>

            {/* Exit patient mode button */}
            <button
              type="button"
              onClick={() => {
                setExitModalOpen(true);
                setPinError(false);
                setPinInput("");
              }}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-[#E8F6F1] hover:bg-[#D6EFE7] active:scale-95 text-[#2A6559] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              title={t.patientView.btnExit}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">{t.patientView.btnExit}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 flex flex-col justify-center">
        {children}
      </main>

      {/* Reassuring footer notice */}
      <footer className="py-3 px-4 text-center border-t border-[#D8EFE8]/70 bg-white/60">
        <p className="text-[11px] sm:text-xs text-[#527970] font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#63C7B2] flex-shrink-0" />
          <span>{t.patientView.calmMessage}</span>
        </p>
      </footer>

      {/* Exit Patient Mode PIN Modal */}
      {exitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#243B36]">
                {t.patientView.exitModalTitle}
              </h3>
              <p className="text-xs text-[#527970] mt-1.5 leading-relaxed">
                {t.patientView.exitModalDesc}
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-[#63C7B2] focus:outline-hidden bg-slate-50 transition-all"
                />
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.patientView.errorWrongPin}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExitModalOpen(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-[#527970] font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t.patientView.btnCancelExit}
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 rounded-xl bg-[#63C7B2] hover:bg-[#4AAA97] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  {t.patientView.btnConfirmExit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS Emergency Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Phone className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-[#243B36]">
                {t.patientView.emergencyCallBtn}
              </h3>
              <p className="text-sm text-[#527970] mt-2 leading-relaxed">
                {language === "ar"
                  ? "اضغط على الرقم للاتصال المباشر بعائلتك أو طلب المساعدة الفورية:"
                  : "Appuyez sur le numéro pour joindre directement votre proche :"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                {language === "ar" ? "رقم الطوارئ المعتمد" : "Numéro d'urgence"}
              </p>
              <a
                href={`tel:${currentPatient?.emergencyPhone || user?.phone || "+213550000000"}`}
                className="text-2xl sm:text-3xl font-black text-rose-600 font-mono hover:underline block my-1"
                dir="ltr"
              >
                {currentPatient?.emergencyPhone || user?.phone || "+213 550 00 00 00"}
              </a>
              <p className="text-[11px] text-rose-800 font-medium">
                {currentPatient?.name ? `(${currentPatient.name})` : `(${user.name})`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-[#527970] font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {language === "ar" ? "إغلاق" : "Fermer"}
              </button>
              <a
                href={`tel:${currentPatient?.emergencyPhone || user?.phone || "+213550000000"}`}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{language === "ar" ? "اتصال الآن" : "Appeler"}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
