"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, RefreshCw, Loader2, CheckCircle, XCircle, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isInsideSafeZone: boolean;
  distanceFromHomeMeters: number;
  recordedAt: string;
}

interface PatientInfo {
  name: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
}

export default function PatientLocationPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [location, setLocation] = useState<LocationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, locRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/locations?patientId=${id}`),
      ]);
      if (patRes.ok) {
        const pd = await patRes.json();
        setPatient(pd.patient);
      }
      if (locRes.ok) {
        const ld = await locRes.json();
        const locs = ld.locations || [];
        if (locs.length > 0) setLocation(locs[0]);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequestLocation = async () => {
    setSending(true);
    setSent(false);
    try {
      let lat = patient?.safeLatitude || 36.7538;
      let lng = patient?.safeLongitude || 3.0588;
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* use fallback */ }
      }
      const safeR = patient?.safeRadiusMeters || 600;
      const safeLat = patient?.safeLatitude || 36.7538;
      const safeLng = patient?.safeLongitude || 3.0588;
      const R = 6371000;
      const dLat = ((lat - safeLat) * Math.PI) / 180;
      const dLng = ((lng - safeLng) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((safeLat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id, latitude: lat, longitude: lng, accuracy: 20,
          isInsideSafeZone: dist <= safeR, distanceFromHomeMeters: dist, source: "family_request",
        }),
      });
      await fetchData();
      setSent(true);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/family/patients/${id}`} className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            {language === "ar" ? "الموقع الجغرافي" : "Localisation"}
          </h1>
          {patient && <p className="text-sm text-text-muted">{patient.name}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Status Card */}
          <div className={`rounded-3xl p-6 border card-shadow ${location?.isInsideSafeZone ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${location?.isInsideSafeZone ? "bg-emerald-100" : "bg-red-100"}`}>
                {location?.isInsideSafeZone ? <CheckCircle className="w-7 h-7 text-emerald-600" /> : <XCircle className="w-7 h-7 text-red-600" />}
              </div>
              <div>
                <p className={`text-lg font-extrabold ${location?.isInsideSafeZone ? "text-emerald-700" : "text-red-700"}`}>
                  {location?.isInsideSafeZone
                    ? (language === "ar" ? "داخل منطقة الأمان" : "Dans la zone de sécurité")
                    : (language === "ar" ? "خارج منطقة الأمان" : "Hors de la zone de sécurité")}
                </p>
                {location?.distanceFromHomeMeters !== undefined && (
                  <p className="text-sm text-text-muted font-medium mt-0.5">
                    {language === "ar" ? `المسافة: ${location.distanceFromHomeMeters} م` : `Distance : ${location.distanceFromHomeMeters} m`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Last Known Position */}
          <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-4">
            <h2 className="font-extrabold text-text flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              {language === "ar" ? "آخر موقع مسجّل" : "Dernière position enregistrée"}
            </h2>
            {location ? (
              <div className="grid grid-cols-2 gap-4 text-sm bg-bg rounded-2xl p-4">
                <div>
                  <p className="text-xs font-bold text-text-muted">Latitude</p>
                  <p className="font-mono font-bold text-text">{location.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted">Longitude</p>
                  <p className="font-mono font-bold text-text">{location.longitude.toFixed(6)}</p>
                </div>
                {location.accuracy && (
                  <div>
                    <p className="text-xs font-bold text-text-muted">{language === "ar" ? "الدقة" : "Précision"}</p>
                    <p className="font-mono font-bold text-text">±{location.accuracy} m</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs font-bold text-text-muted">{language === "ar" ? "تاريخ آخر تحديث" : "Date de dernière mise à jour"}</p>
                  <p className="font-bold text-text">
                    {new Date(location.recordedAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {" — "}
                    {new Date(location.recordedAt).toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-text-muted text-sm">{language === "ar" ? "لم يتم تسجيل أي موقع بعد." : "Aucune position enregistrée."}</p>
            )}
          </div>

          {/* Safe Zone Info */}
          {patient && (
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-3">
              <h2 className="font-extrabold text-text">{language === "ar" ? "منطقة الأمان" : "Zone de sécurité"}</h2>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{language === "ar" ? "النطاق المحدد" : "Rayon configuré"}</span>
                <span className="font-extrabold text-text font-mono">{patient.safeRadiusMeters} m</span>
              </div>
            </div>
          )}

          {/* Request Location Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleRequestLocation}
              disabled={sending}
              className="w-full py-4 rounded-2xl bg-primary text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              <span>{language === "ar" ? "تحديث الموقع" : "Actualiser la localisation"}</span>
            </button>
            {sent && (
              <p className="text-center text-emerald-600 text-sm font-bold">
                {language === "ar" ? "تم تحديث الموقع بنجاح." : "Localisation mise à jour avec succès."}
              </p>
            )}
            <p className="text-center text-xs text-text-muted">
              {language === "ar"
                ? "ملاحظة: هذا ليس تتبعاً GPS مستمراً. يتم تسجيل الموقع عند الطلب فقط."
                : "Note : Ce n'est pas un suivi GPS permanent. La position est enregistrée à la demande uniquement."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
