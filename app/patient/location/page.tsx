"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Check, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function PatientLocationPage() {
  const { language } = useI18n();
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedDate, setSavedDate] = useState("");
  const [savedTime, setSavedTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const localActiveId = typeof window !== "undefined" ? localStorage.getItem("toumoanina_active_patient_id") : null;
    if (localActiveId) {
      setPatientId(localActiveId);
    }

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const activeId = localActiveId || d.user?.activePatientId;
        if (activeId) {
          setPatientId(activeId);
        } else {
          fetch("/api/patients", { cache: "no-store" })
            .then((pr) => pr.json())
            .then((pd) => {
              if (pd.patients?.[0]?.id) {
                setPatientId(pd.patients[0].id);
              }
            });
        }
      })
      .catch(() => {});
  }, []);

  const handleSendLocation = async () => {
    setLoading(true);
    setError("");
    let lat = 36.7538;
    let lng = 3.0588;
    try {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch { /* use fallback */ }

    if (!patientId) { setLoading(false); setError(language === "ar" ? "لم يتم تحديد المريض." : "Patient non identifié."); return; }

    try {
      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, latitude: lat, longitude: lng, accuracy: 20, isInsideSafeZone: true, distanceFromHomeMeters: 0, source: "patient_device" }),
      });
      const now = new Date();
      setSavedDate(now.toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }));
      setSavedTime(now.toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setSaved(true);
    } catch {
      setError(language === "ar" ? "حدث خطأ. حاول مجدداً." : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-10 py-8 px-4">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-[#E8F6F1] flex items-center justify-center mx-auto">
          <MapPin className="w-10 h-10 text-[#63C7B2]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#243B36]">
          {language === "ar" ? "موقعي" : "Ma localisation"}
        </h1>
        <p className="text-[#4A7065] text-lg">
          {language === "ar"
            ? "أخبر عائلتك بمكانك الآن."
            : "Informez votre famille de votre position."}
        </p>
      </div>

      {saved ? (
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-3xl border-2 border-emerald-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-800">
              {language === "ar" ? "تم تسجيل الموقع." : "Localisation enregistrée."}
            </p>
            <div className="space-y-1 text-emerald-700 font-bold text-lg">
              <p>{language === "ar" ? `التاريخ: ${savedDate}` : `Date : ${savedDate}`}</p>
              <p>{language === "ar" ? `الوقت: ${savedTime}` : `Heure : ${savedTime}`}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/patient")}
            className="w-full py-5 rounded-3xl bg-[#63C7B2] text-white font-extrabold text-xl flex items-center justify-center gap-3 hover:bg-[#4AAA97] transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
            <span>{language === "ar" ? "العودة للرئيسية" : "Retour à l'accueil"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-6 space-y-3 text-center">
            <p className="text-[#4A7065] text-lg leading-relaxed">
              {language === "ar"
                ? "اضغط على الزر لإرسال موقعك إلى عائلتك. لا يتم التتبع تلقائياً."
                : "Appuyez sur le bouton pour envoyer votre position à votre famille. Le suivi n'est pas automatique."}
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-center font-bold text-lg">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSendLocation}
            disabled={loading}
            className="w-full py-6 rounded-3xl bg-[#63C7B2] text-white font-extrabold text-2xl flex items-center justify-center gap-4 shadow-lg hover:bg-[#4AAA97] transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <MapPin className="w-8 h-8" />}
            <span>{language === "ar" ? "أرسل موقعي" : "Activer ma localisation"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
