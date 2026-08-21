"use client";

import { useState } from "react";
import {
  MapPin, Navigation, Loader2, CheckCircle2,
  AlertCircle, Compass, Radio, Building,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface HomeLocationPickerProps {
  latitude: string | number;
  longitude: string | number;
  radius: string | number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

const CITY_PRESETS = [
  { nameAr: "الجزائر العاصمة", nameFr: "Alger", lat: 36.7538, lng: 3.0588 },
  { nameAr: "وهران", nameFr: "Oran", lat: 35.6987, lng: -0.6349 },
  { nameAr: "قسنطينة", nameFr: "Constantine", lat: 36.3650, lng: 6.6147 },
  { nameAr: "عنابة", nameFr: "Annaba", lat: 36.9000, lng: 7.7667 },
  { nameAr: "سطيف", nameFr: "Sétif", lat: 36.1898, lng: 5.4108 },
  { nameAr: "البليدة", nameFr: "Blida", lat: 36.4700, lng: 2.8300 },
];

const RADIUS_PRESETS = [500, 800, 1000, 1500, 2000];

export default function HomeLocationPicker({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
}: HomeLocationPickerProps) {
  const { language } = useI18n();
  const isAr = language === "ar";

  const [detecting, setDetecting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAutoDetect = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setFeedback({
        type: "error",
        message: isAr
          ? "خاصية تحديد الموقع الجغرافي غير مدعومة في هذا المتصفح."
          : "La géolocalisation n'est pas supportée par votre navigateur.",
      });
      return;
    }

    setDetecting(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(5));
        const lng = parseFloat(position.coords.longitude.toFixed(5));
        const accuracy = Math.round(position.coords.accuracy || 10);

        onLocationChange(lat, lng);
        setDetecting(false);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تحديد موقع المنزل بنجاح (دقة ±${accuracy}م): ${lat}° N, ${lng}° E`
            : `Position du domicile détectée avec succès (±${accuracy}m) : ${lat}° N, ${lng}° E`,
        });

        setTimeout(() => setFeedback(null), 6000);
      },
      (error) => {
        setDetecting(false);
        let errorMsg = isAr
          ? "تعذر الحصول على الموقع. يرجى تفعيل إذن الموقع (GPS) في المتصفح."
          : "Impossible de récupérer la position GPS. Veuillez autoriser l'accès dans votre navigateur.";

        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = isAr
            ? "تم رفض الإذن بالوصول للموقع. يرجى السماح للمتصفح بالوصول للموقع."
            : "Permission d'accès à la localisation refusée.";
        }

        setFeedback({
          type: "error",
          message: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCityPreset = (city: typeof CITY_PRESETS[0]) => {
    onLocationChange(city.lat, city.lng);
    setFeedback({
      type: "success",
      message: isAr
        ? `تم تعيين الإحداثيات لمدينة: ${city.nameAr}`
        : `Coordonnées définies pour : ${city.nameFr}`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-primary/20 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-text leading-tight">
              {isAr ? "موقع المنزل ونطاق الأمان (Geofence)" : "Position du domicile et périmètre de sécurité"}
            </h3>
            <p className="text-[11px] text-text-muted">
              {isAr ? "حدد مركز ونطاق الأمان الجغرافي للقريب" : "Définissez le centre et le rayon de sécurité"}
            </p>
          </div>
        </div>

        {/* Smart GPS Auto-Detect Button */}
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-brand text-white font-extrabold text-xs shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
        >
          {detecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>
            {detecting
              ? (isAr ? "جارٍ تحديد موقعك…" : "Détection en cours…")
              : (isAr ? "📍 تحديد موقعي الحالي تلقائياً" : "📍 Détecter ma position actuelle")}
          </span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold border animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          )}
          <span className="flex-1">{feedback.message}</span>
        </div>
      )}

      {/* Quick City Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-text-muted flex items-center gap-1.5">
          <Building className="w-3 h-3 text-primary" />
          {isAr ? "أو اختر مدينة سريعة:" : "Ou choisissez une ville rapide :"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CITY_PRESETS.map((c) => {
            const isMatch =
              parseFloat(String(latitude)) === c.lat &&
              parseFloat(String(longitude)) === c.lng;
            return (
              <button
                key={c.nameFr}
                type="button"
                onClick={() => handleCityPreset(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isMatch
                    ? "bg-primary text-white border-primary shadow-2xs"
                    : "bg-white text-text-muted border-border hover:border-primary/40 hover:text-text"
                }`}
              >
                {isAr ? c.nameAr : c.nameFr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinates Inputs Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">
            {isAr ? "خط عرض المنزل (Latitude)" : "Latitude du domicile"} <span className="text-primary">*</span>
          </label>
          <div className="flex items-center rounded-xl bg-white border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) =>
                onLocationChange(
                  parseFloat(e.target.value) || 0,
                  parseFloat(String(longitude)) || 0
                )
              }
              className="flex-1 px-3.5 py-2.5 bg-transparent border-0 text-text font-mono text-xs focus:outline-none"
              dir="ltr"
              placeholder="36.75380"
            />
            <span className="px-3 py-2.5 bg-slate-100 text-[11px] font-bold text-text-muted border-s border-border select-none" dir="ltr">
              °N
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text mb-1.5 block">
            {isAr ? "خط طول المنزل (Longitude)" : "Longitude du domicile"} <span className="text-primary">*</span>
          </label>
          <div className="flex items-center rounded-xl bg-white border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) =>
                onLocationChange(
                  parseFloat(String(latitude)) || 0,
                  parseFloat(e.target.value) || 0
                )
              }
              className="flex-1 px-3.5 py-2.5 bg-transparent border-0 text-text font-mono text-xs focus:outline-none"
              dir="ltr"
              placeholder="3.05880"
            />
            <span className="px-3 py-2.5 bg-slate-100 text-[11px] font-bold text-text-muted border-s border-border select-none" dir="ltr">
              °E
            </span>
          </div>
        </div>
      </div>

      {/* Safety Radius Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-text flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-primary" />
            {isAr ? "نصف قطر الأمان المسموح به (بالمتر)" : "Rayon de sécurité autorisé (en mètres)"}
          </label>
          <span className="text-xs font-extrabold text-primary font-mono" dir="ltr">
            {radius} m
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {RADIUS_PRESETS.map((r) => {
            const isMatch = parseInt(String(radius)) === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isMatch
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-text-muted border-border hover:border-primary/40 hover:text-text"
                }`}
              >
                {r} {isAr ? "متر" : "m"}
              </button>
            );
          })}
          <div className="flex-1 min-w-[120px]">
            <input
              type="number"
              min={100}
              max={10000}
              step={50}
              value={radius}
              onChange={(e) => onRadiusChange(parseInt(e.target.value) || 600)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-border text-text font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
              placeholder={isAr ? "أو أدخل مسافة مخصصة" : "Distance personnalisée"}
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
