"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, MapPin, Smile, Bell, Activity,
  CheckCircle, AlertTriangle, ChevronRight, ChevronLeft,
  Gamepad2, Clock, Shield, UserCheck, RefreshCw,
  Heart, TrendingUp, Zap, Plus, Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  emergencyPhone?: string;
  bloodType?: string;
  photoUrl?: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
}

interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  isInsideSafeZone: boolean;
  distanceFromHomeMeters: number;
  recordedAt: string;
}

interface MoodRecord {
  id: string;
  mood: "good" | "neutral" | "difficult";
  notes?: string;
  recordedAt: string;
}

interface SafetyAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  isResolved: boolean;
  patientName: string;
  createdAt: string;
}

interface ActivityRecord {
  id: string;
  activityType: string;
  turns: number;
  durationSeconds: number;
  completedAt: string;
}

const MOOD_EMOJI: Record<string, string> = { good: "😊", neutral: "😐", difficult: "😔" };
const MOOD_COLOR: Record<string, string> = {
  good: "text-emerald-600 bg-emerald-50 border-emerald-200",
  neutral: "text-amber-600 bg-amber-50 border-amber-200",
  difficult: "text-red-500 bg-red-50 border-red-200",
};

function formatAge(birthDate: string) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function timeAgo(dateStr: string, lang: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return lang === "ar" ? "الآن" : "Il y a moins d'1 min";
  if (diff < 3600) return lang === "ar" ? `منذ ${Math.floor(diff/60)} د` : `Il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return lang === "ar" ? `منذ ${Math.floor(diff/3600)} س` : `Il y a ${Math.floor(diff/3600)}h`;
  return lang === "ar" ? `منذ ${Math.floor(diff/86400)} يوم` : `Il y a ${Math.floor(diff/86400)}j`;
}

export default function FamilyDashboardPage() {
  const { t, isRTL, language } = useI18n();
  const { user, setActivePatientId } = useAuth();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [latestLocation, setLatestLocation] = useState<LocationRecord | null>(null);
  const [latestMood, setLatestMood] = useState<MoodRecord | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<SafetyAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, alertsRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/alerts"),
      ]);
      const pData = await pRes.json();
      const alertsData = await alertsRes.json();

      const pts: Patient[] = pData.patients || [];
      setPatients(pts);

      const current = pts.find((p) => p.id === user?.activePatientId) || pts[0] || null;
      setActivePatient(current);

      if (current) {
        const [locRes, moodRes, actRes] = await Promise.all([
          fetch(`/api/locations?patientId=${current.id}`),
          fetch(`/api/moods?patientId=${current.id}`),
          fetch(`/api/activities?patientId=${current.id}`),
        ]);
        const locData = await locRes.json();
        const moodData = await moodRes.json();
        const actData = await actRes.json();

        setLatestLocation(locData.locations?.[0] || null);
        setLatestMood(moodData.moods?.[0] || null);
        setRecentActivities((actData.activities || []).slice(0, 3));
      }

      const alerts = alertsData.alerts || [];
      setActiveAlerts(alerts.filter((a: SafetyAlert) => !a.isResolved).slice(0, 3));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.activePatientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleSelectPatient = async (patient: Patient) => {
    setActivePatient(patient);
    setActivePatientId(patient.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("toumoanina_active_patient_id", patient.id);
    }

    // Persist choice on server (Turso + memory)
    fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activePatientId: patient.id }),
    }).catch(() => {});

    try {
      const [locRes, moodRes, actRes] = await Promise.all([
        fetch(`/api/locations?patientId=${patient.id}`),
        fetch(`/api/moods?patientId=${patient.id}`),
        fetch(`/api/activities?patientId=${patient.id}`),
      ]);
      const locData = await locRes.json();
      const moodData = await moodRes.json();
      const actData = await actRes.json();

      setLatestLocation(locData.locations?.[0] || null);
      setLatestMood(moodData.moods?.[0] || null);
      setRecentActivities((actData.activities || []).slice(0, 3));
    } catch (err) {
      console.error("Error switching patient data:", err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: true }),
    });
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-text-muted font-medium">
            {language === "ar" ? "جارٍ التحميل…" : "Chargement…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text leading-tight">
            {t.dash.welcome} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">{t.dash.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{language === "ar" ? "تحديث" : "Actualiser"}</span>
          </button>
          <Link
            href="/patient"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.dash.btnLaunchPatientMode}</span>
          </Link>
        </div>
      </div>

      {/* Empty State — no patients yet */}
      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white rounded-3xl border border-dashed border-primary/30 card-shadow">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center max-w-sm px-4">
            <h2 className="text-xl font-extrabold text-text mb-2">
              {language === "ar" ? "لا يوجد مريض بعد" : "Aucun proche ajouté"}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              {language === "ar"
                ? "أضف أول مريض لتبدأ في متابعة صحته وسلامته"
                : "Ajoutez un proche pour commencer à suivre sa santé et sa sécurité."}
            </p>
          </div>
          <Link
            href="/family/patients"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-brand text-white font-bold text-sm shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            <Users className="w-4 h-4" />
            {language === "ar" ? "إضافة مريض" : "Ajouter un proche"}
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: t.dash.statPatients,
                value: patients.length.toString(),
                color: "bg-primary/10 text-primary",
                iconBg: "bg-primary/15",
              },
              {
                icon: activeAlerts.length > 0 ? AlertTriangle : Shield,
                label: t.dash.statSafety,
                value: activeAlerts.length > 0 ? t.dash.statSafetyAlert : t.dash.statSafetySafe,
                color: activeAlerts.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700",
                iconBg: activeAlerts.length > 0 ? "bg-red-100" : "bg-emerald-100",
              },
              {
                icon: Smile,
                label: t.dash.statMood,
                value: latestMood ? MOOD_EMOJI[latestMood.mood] : t.dash.statMoodNone,
                color: "bg-amber-50 text-amber-700",
                iconBg: "bg-amber-100",
                large: !!latestMood,
              },
              {
                icon: Activity,
                label: t.sidebar.activities,
                value: recentActivities.length > 0 ? `${recentActivities[0]?.turns} coups` : "—",
                color: "bg-secondary/10 text-secondary-dark",
                iconBg: "bg-secondary/20",
              },
            ].map(({ icon: Icon, label, value, color, iconBg, large }) => (
              <div
                key={label}
                className={`rounded-2xl p-4 border border-border/50 card-shadow flex items-start gap-3 ${color}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold opacity-70 mb-0.5 leading-tight">{label}</p>
                  <p className={`font-extrabold leading-tight ${large ? "text-2xl" : "text-base"}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-patient Selector Bar (When 2+ patients exist) */}
          {patients.length > 1 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-border/50 card-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-extrabold text-text">
                    {language === "ar" ? "اختيار المريض للمتابعة المباشرة" : "Sélectionner le proche à suivre en direct"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {patients.length} {language === "ar" ? "مرضى" : "proches"}
                  </span>
                </div>
                <Link
                  href="/family/patients"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "ar" ? "إضافة مريض" : "Ajouter un proche"}</span>
                </Link>
              </div>

              {/* Horizontal Switcher List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {patients.map((p) => {
                  const isSelected = activePatient?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className={`p-3 rounded-2xl border text-start transition-all flex items-center gap-3 relative ${
                        isSelected
                          ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-sm"
                          : "bg-bg/60 border-border/80 hover:border-primary/40 hover:bg-white"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gradient-brand flex items-center justify-center text-white font-bold text-base">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold text-text truncate">{p.name}</p>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              <Check className="w-2.5 h-2.5" />
                              {language === "ar" ? "محدد" : "Actif"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {formatAge(p.birthDate)} {t.patients.ageYears}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Patient Card + Quick Actions — col span 2 */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Active patient */}
              {activePatient && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-bg">
                        {activePatient.photoUrl ? (
                          <img src={activePatient.photoUrl} alt={activePatient.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xl">
                            {activePatient.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-extrabold text-text">{activePatient.name}</h2>
                          {patients.length > 1 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {language === "ar" ? "المحدد حالياً" : "Actuellement suivi"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted">
                          {formatAge(activePatient.birthDate)} {t.patients.ageYears}
                        </p>
                        {latestMood && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border mt-1 ${MOOD_COLOR[latestMood.mood]}`}>
                            {MOOD_EMOJI[latestMood.mood]}
                            {t.moods[`mood${latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)}` as "moodGood"]}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/family/patients"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {t.dash.actionView}
                      <ArrowIcon className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Location status */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
                      latestLocation?.isInsideSafeZone !== false
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        latestLocation?.isInsideSafeZone !== false ? "bg-emerald-100" : "bg-red-100"
                      }`}>
                        <MapPin className={`w-4 h-4 ${latestLocation?.isInsideSafeZone !== false ? "text-emerald-600" : "text-red-500"}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text mb-0.5">{t.dash.geofenceStatus}</p>
                        <p className={`text-xs font-semibold ${latestLocation?.isInsideSafeZone !== false ? "text-emerald-700" : "text-red-600"}`}>
                          {latestLocation?.isInsideSafeZone !== false ? t.dash.geofenceActive : t.dash.geofenceBreach}
                        </p>
                        {latestLocation && (
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {t.dash.lastKnownLocation} {timeAgo(latestLocation.recordedAt, language)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl p-4 border border-border/50 bg-bg flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text mb-0.5">{t.dash.recentActivitiesTitle}</p>
                        <p className="text-xs font-semibold text-text-muted">
                          {recentActivities.length > 0
                            ? `${recentActivities.length} ${language === "ar" ? "جولة" : "partie(s)"}`
                            : "—"}
                        </p>
                        {recentActivities[0] && (
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {timeAgo(recentActivities[0].completedAt, language)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Patients Overview Grid (When 2+ patients exist) */}
              {patients.length > 1 && (
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-text flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>
                        {language === "ar"
                          ? `جميع أفراد العائلة المتابعين (${patients.length})`
                          : `Tous les membres de la famille suivis (${patients.length})`}
                      </span>
                    </h3>
                    <Link
                      href="/family/patients"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{language === "ar" ? "إدارة الملفات" : "Gérer les profils"}</span>
                      <ArrowIcon className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {patients.map((p) => {
                      const isSelected = activePatient?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? "bg-primary/[0.02] border-primary/40 shadow-sm"
                              : "bg-bg/40 border-border/60 hover:bg-white hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-bg">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-extrabold text-text text-sm truncate">{p.name}</h4>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
                                    {language === "ar" ? "نشط حالياً" : "Actif"}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectPatient(p)}
                                    className="text-[10px] font-bold text-primary hover:text-primary-dark border border-primary/30 bg-white hover:bg-primary/5 px-2.5 py-0.5 rounded-full transition-colors flex-shrink-0 shadow-xs"
                                  >
                                    {language === "ar" ? "تبديل إليه" : "Sélectionner"}
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-text-muted mt-0.5">
                                {formatAge(p.birthDate)} {t.patients.ageYears}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                            <span className="text-text-muted font-mono" dir="ltr">
                              {p.emergencyPhone}
                            </span>
                            <Link
                              href="/family/patients"
                              className="font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>{language === "ar" ? "الملف الكامل" : "Détails"}</span>
                              <ArrowIcon className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow">
                <h3 className="text-sm font-extrabold text-text mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  {t.dash.quickActions}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { href: "/patient",          icon: UserCheck,  label: t.dash.btnLaunchPatientMode, color: "from-primary to-secondary" },
                    { href: "/family/patients",  icon: Users,      label: t.dash.btnAddPatient,        color: "from-secondary to-primary" },
                    { href: "/family/tracking",  icon: MapPin,     label: t.dash.btnTrackNow,          color: "from-emerald-400 to-primary" },
                    { href: "/family/moods",     icon: Smile,      label: t.dash.btnLogMood,           color: "from-amber-400 to-orange-400" },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white hover:opacity-90 hover:-translate-y-0.5 transition-all text-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-bold leading-tight">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts + Recent Moods */}
            <div className="flex flex-col gap-6">
              {/* Active Alerts */}
              <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-text flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    {t.dash.activeAlertsTitle}
                    {activeAlerts.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {activeAlerts.length}
                      </span>
                    )}
                  </h3>
                  <Link href="/family/alerts" className="text-[11px] text-primary font-semibold hover:underline">
                    {t.dash.viewAllAlerts}
                  </Link>
                </div>

                {activeAlerts.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-text-muted">{t.dash.noAlerts}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-2xl p-3 border flex items-start gap-3 ${
                          alert.severity === "high"
                            ? "bg-red-50 border-red-200"
                            : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${alert.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text leading-tight truncate">{alert.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            <Clock className="w-2.5 h-2.5 inline mr-1" />
                            {timeAgo(alert.createdAt, language)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap border border-emerald-200 bg-white px-2 py-1 rounded-lg"
                        >
                          {t.dash.actionResolve}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Moods */}
              <div className="bg-white rounded-3xl p-5 border border-border/50 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-text flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    {t.dash.recentMoodsTitle}
                  </h3>
                  <Link href="/family/moods" className="text-[11px] text-primary font-semibold hover:underline">
                    {t.dash.actionView}
                  </Link>
                </div>

                {!latestMood ? (
                  <p className="text-xs text-text-muted text-center py-4">{t.moods.emptyMoods}</p>
                ) : (
                  <div className={`rounded-2xl p-4 border ${MOOD_COLOR[latestMood.mood]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{MOOD_EMOJI[latestMood.mood]}</span>
                      <div>
                        <p className="text-xs font-bold">{t.moods[`mood${latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)}` as "moodGood"]}</p>
                        <p className="text-[10px] opacity-70">{timeAgo(latestMood.recordedAt, language)}</p>
                      </div>
                    </div>
                    {latestMood.notes && (
                      <p className="text-xs opacity-80 mt-1 line-clamp-2">{latestMood.notes}</p>
                    )}
                  </div>
                )}

                <Link
                  href="/family/moods"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  {t.moods.btnLogMood}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
