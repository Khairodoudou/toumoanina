"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin, Navigation, Shield, AlertTriangle,
  Clock, CheckCircle, ExternalLink,
  Loader2, RefreshCw, Activity, Home,
  User, Radio, ChevronRight, ChevronLeft,
  WifiOff, Wifi, History, Users, Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Patient {
  id: string;
  name: string;
  photoUrl?: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
}

interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  isInsideSafeZone: boolean;
  distanceFromHomeMeters: number;
  recordedAt: string;
  source: string;
}

function timeAgo(dateStr: string, isAr: boolean) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return isAr ? "الآن" : "À l'instant";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return isAr ? `منذ ${mins} دقيقة` : `Il y a ${mins} min`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return isAr ? `منذ ${hours} ساعة` : `Il y a ${hours}h`;
  }
  const days = Math.floor(diff / 86400);
  return isAr ? `منذ ${days} يوم` : `Il y a ${days}j`;
}

function formatDateTime(dateStr: string, isAr: boolean) {
  return new Date(dateStr).toLocaleString(isAr ? "ar-DZ" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildMapUrl(lat: number, lng: number) {
  const delta = 0.008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export default function TrackingPage() {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const fetchLocation = useCallback(async (patient: Patient | null) => {
    if (!patient) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/locations?patientId=${patient.id}`);
      const data = await res.json();
      const locs: LocationRecord[] = data.locations || [];
      setLocations(locs);
      setMapKey((k) => k + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      fetchLocation(target);
    });
  }, [fetchLocation]);

  const switchPatient = (p: Patient) => {
    if (activePatient?.id === p.id) return;
    setActivePatient(p);
    setLocations([]);
    setLoading(true);
    // Persist the selected patient so /patient/location sends GPS to the right patient
    fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activePatientId: p.id }),
    }).catch(() => {});
    fetchLocation(p);
  };

  const latestLoc = locations[0] ?? null;
  const mapLat = latestLoc?.latitude ?? activePatient?.safeLatitude ?? 36.7538;
  const mapLng = latestLoc?.longitude ?? activePatient?.safeLongitude ?? 3.0588;
  const mapUrl = buildMapUrl(mapLat, mapLng);
  const isInside = latestLoc?.isInsideSafeZone ?? true;
  const isOutside = latestLoc && !latestLoc.isInsideSafeZone;

  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            {t.tracking.title}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t.tracking.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLocation(activePatient)}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-brand text-white text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex-shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث الموقع" : "Actualiser la localisation"}</span>
        </button>
      </div>

      {/* ── Patient Selector Bar (Enhanced UI/UX) ────────── */}
      {patients.length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-border/50 card-shadow">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-extrabold text-text">
                {isAr ? "اختيار المريض للمتابعة الجغرافية" : "Sélectionner le proche à localiser"}
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {patients.length} {isAr ? (patients.length === 1 ? "مريض" : "مرضى") : (patients.length === 1 ? "proche" : "proches")}
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
                      {isAr ? `نصف القطر: ${p.safeRadiusMeters}م` : `Périmètre : ${p.safeRadiusMeters}m`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Alert banner ─────────────────────────────────── */}
      {isOutside && (
        <div className="flex items-center gap-3.5 p-4 bg-red-50 border-2 border-red-300 rounded-3xl text-red-700 shadow-sm animate-pulse-once">
          <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm">
              {isAr
                ? `🚨 تنبيه أمني — ${activePatient?.name} متواجد خارج نطاق الأمان!`
                : `🚨 Alerte de sécurité — ${activePatient?.name} est hors de la zone de sécurité !`}
            </p>
            <p className="text-xs opacity-85 mt-0.5 font-medium">
              {isAr
                ? `يبعد ${latestLoc!.distanceFromHomeMeters}م عن المنزل · التوقيت: ${formatDateTime(latestLoc!.recordedAt, isAr)}`
                : `À ${latestLoc!.distanceFromHomeMeters}m du domicile · Enregistré à : ${formatDateTime(latestLoc!.recordedAt, isAr)}`}
            </p>
          </div>
          {activePatient && (
            <Link
              href={`/family/patients/${activePatient.id}/alerts`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span>{isAr ? "عرض التنبيهات" : "Voir alertes"}</span>
              <ChevronIcon className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Main 2-column layout ─────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* ── LEFT: Map (hero, 3 cols) ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Map card */}
          <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden flex flex-col">
            {/* Map toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm shadow-primary/20 flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-text leading-tight">
                    {isAr ? "خريطة الموقع المباشر" : "Carte de localisation"}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {latestLoc
                      ? (isAr
                          ? `آخر تحديث: ${timeAgo(latestLoc.recordedAt, isAr)}`
                          : `Mis à jour : ${timeAgo(latestLoc.recordedAt, isAr)}`)
                      : (isAr ? "لا توجد إحداثيات مسجلة" : "Aucune position enregistrée")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {latestLoc ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    {isAr ? "موقع محدد" : "Position connue"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                    <WifiOff className="w-3 h-3 text-slate-400" />
                    {isAr ? "لا توجد بيانات" : "Aucune donnée"}
                  </span>
                )}
                {latestLoc && (
                  <a
                    href={`https://www.google.com/maps?q=${latestLoc.latitude},${latestLoc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-xl hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isAr ? "خرائط Google" : "Google Maps"}
                  </a>
                )}
              </div>
            </div>

            {/* OpenStreetMap iframe */}
            <div className="relative bg-slate-100" style={{ height: 380 }}>
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-text-muted font-medium">
                    {isAr ? "جارٍ تحميل الخريطة…" : "Chargement de la carte…"}
                  </p>
                </div>
              ) : (
                <iframe
                  key={mapKey}
                  title={isAr ? "خريطة موقع المريض" : "Carte de localisation du patient"}
                  src={mapUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          </div>

          {/* Coordinates row below map */}
          {latestLoc && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CoordTile
                label={isAr ? "آخر تحديث" : "Horodatage"}
                icon={<Clock className="w-3.5 h-3.5" />}
                value={timeAgo(latestLoc.recordedAt, isAr)}
                sub={formatDateTime(latestLoc.recordedAt, isAr)}
              />
              <CoordTile
                label={isAr ? "دقة GPS" : "Précision GPS"}
                icon={<Activity className="w-3.5 h-3.5" />}
                value={`±${latestLoc.accuracy}m`}
                mono
              />
              <CoordTile
                label={isAr ? "خط العرض (Lat)" : "Latitude"}
                icon={<MapPin className="w-3.5 h-3.5" />}
                value={latestLoc.latitude.toFixed(5)}
                mono
              />
              <CoordTile
                label={isAr ? "خط الطول (Lng)" : "Longitude"}
                icon={<Navigation className="w-3.5 h-3.5" />}
                value={latestLoc.longitude.toFixed(5)}
                mono
              />
            </div>
          )}

          {!latestLoc && !loading && (
            <div className="bg-slate-50 border border-dashed border-border rounded-3xl p-8 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-border/60 flex items-center justify-center text-text-muted shadow-sm">
                <WifiOff className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-bold text-text mt-1">
                {isAr ? "لا توجد أي إحداثيات مسجلة لهذا المريض" : "Aucune position enregistrée pour ce patient"}
              </p>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                {isAr
                  ? "سيظهر الموقع هنا تلقائياً فور تفعيل وتحديد الموقع من جهاز المريض."
                  : "La position s'affichera ici dès que le patient l'activera sur son appareil."}
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Geofence & History (2 cols) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Geofence card */}
          <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow">
            {/* Card header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-text leading-tight">
                  {t.tracking.safeZoneTitle}
                </h2>
                <p className="text-[11px] text-text-muted">
                  {isAr ? "المحيط الأمني المحدد حول المنزل" : "Geofence de sécurité configuré"}
                </p>
              </div>
            </div>

            {/* Status badge — big */}
            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border font-bold text-sm mb-4 ${
              isInside
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isInside ? "bg-emerald-100" : "bg-red-100"
              }`}>
                {isInside
                  ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : <AlertTriangle className="w-5 h-5 text-red-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="leading-tight">
                  {isInside
                    ? (isAr ? "🟢 المريض داخل نطاق الأمان" : "🟢 Dans la zone de sécurité")
                    : (isAr ? "🔴 المريض خارج نطاق الأمان!" : "🔴 Hors de la zone de sécurité")}
                </p>
                {latestLoc && (
                  <p className="text-[11px] font-normal opacity-80 mt-0.5">
                    {isAr
                      ? `المسافة الحالية من المنزل: ${latestLoc.distanceFromHomeMeters} متر`
                      : `Distance actuelle du domicile : ${latestLoc.distanceFromHomeMeters}m`}
                  </p>
                )}
              </div>
            </div>

            {/* Geofence details */}
            <div className="space-y-2.5">
              {activePatient && (
                <>
                  <GeoRow icon={<Home className="w-3.5 h-3.5" />} label={isAr ? "مركز المنطقة الآمنة" : "Centre de zone"}>
                    <span className="font-mono text-[11px] font-semibold text-text" dir="ltr">
                      {activePatient.safeLatitude.toFixed(4)}, {activePatient.safeLongitude.toFixed(4)}
                    </span>
                  </GeoRow>
                  <GeoRow icon={<Radio className="w-3.5 h-3.5" />} label={isAr ? "نصف القطر المسموح به" : "Rayon autorisé"}>
                    <span className="font-bold text-text" dir="ltr">
                      {activePatient.safeRadiusMeters} m
                    </span>
                  </GeoRow>
                </>
              )}
              {latestLoc && (
                <GeoRow icon={<MapPin className="w-3.5 h-3.5" />} label={isAr ? "المسافة الفعلية الآن" : "Distance actuelle"}>
                  <span className={`font-bold ${isInside ? "text-emerald-600" : "text-red-600"}`} dir="ltr">
                    {latestLoc.distanceFromHomeMeters} m
                  </span>
                </GeoRow>
              )}
            </div>

            {/* Alert link */}
            {isOutside && activePatient && (
              <Link
                href={`/family/patients/${activePatient.id}/alerts`}
                className="mt-4 flex items-center justify-between gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3.5 py-2.5 rounded-2xl transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isAr ? "الاطلاع على سجل التنبيهات" : "Consulter le centre d'alertes"}
                </span>
                <ChevronIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Location History Card */}
          <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow flex-1">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <History className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-text leading-tight">
                    {t.tracking.historyTitle}
                  </h2>
                  <p className="text-[11px] text-text-muted">
                    {isAr ? "آخر التحديثات والإحداثيات المسجلة" : "Dernières positions horodatées"}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-center text-text-muted">
                <Clock className="w-6 h-6 opacity-40" />
                <p className="text-xs">{t.tracking.noHistory}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {locations.slice(0, 8).map((loc, idx) => (
                  <div
                    key={loc.id || idx}
                    className={`flex items-start justify-between gap-2 p-3 rounded-2xl border text-xs transition-colors ${
                      loc.isInsideSafeZone
                        ? "bg-slate-50/80 border-border/40 hover:bg-slate-100/60"
                        : "bg-red-50/50 border-red-200 hover:bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                          loc.isInsideSafeZone ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-red-500 ring-2 ring-red-200"
                        }`}
                      />
                      <div>
                        <p className="font-mono font-bold text-text leading-tight" dir="ltr">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {timeAgo(loc.recordedAt, isAr)} · {formatDateTime(loc.recordedAt, isAr)}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`font-bold ${loc.isInsideSafeZone ? "text-emerald-700" : "text-red-700"}`} dir="ltr">
                        {loc.distanceFromHomeMeters}m
                      </span>
                      <p className="text-[9px] text-text-muted mt-0.5">
                        ±{loc.accuracy}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function CoordTile({
  label,
  icon,
  value,
  sub,
  mono,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-3.5 border border-border/50 card-shadow">
      <div className="flex items-center gap-1.5 text-text-muted mb-2 text-[10px] font-bold uppercase tracking-wide">
        <span className="opacity-60">{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`font-bold text-text text-sm ${mono ? "font-mono" : ""}`} dir="ltr">
        {value}
      </p>
      {sub && <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{sub}</p>}
    </div>
  );
}

function GeoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-xs">
      <span className="flex items-center gap-1.5 text-text-muted">
        <span className="opacity-60">{icon}</span>
        <span>{label}</span>
      </span>
      {children}
    </div>
  );
}
