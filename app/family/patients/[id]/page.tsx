"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, MapPin, Bell, Smile, Activity,
  Phone, Calendar, Droplets, FileText, User, Edit2,
  UserCheck, History, Heart, Loader2, ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  bloodType?: string;
  emergencyPhone: string;
  photoUrl?: string;
  dailyHabits?: string;
  dietPreferences?: string;
  medicalNotes?: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
  createdAt: string;
}

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const router = useRouter();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ChevronIcon = isRTL ? ChevronRight : ChevronRight;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPatient = useCallback(async () => {
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      setPatient(data.patient || null);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPatient(); }, [fetchPatient]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (notFound || !patient) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-xl font-extrabold text-text">{language === "ar" ? "الملف غير موجود." : "Profil introuvable."}</p>
        <Link href="/family/patients" className="text-primary underline text-sm">
          {language === "ar" ? "العودة إلى القائمة" : "Retour à la liste"}
        </Link>
      </div>
    );
  }

  const age = calcAge(patient.birthDate);

  const quickActions = [
    { href: `/family/patients/${id}/location`, icon: MapPin, label: language === "ar" ? "الموقع" : "Localisation", color: "text-blue-600 bg-blue-50" },
    { href: `/family/patients/${id}/alerts`, icon: Bell, label: language === "ar" ? "التنبيهات" : "Alertes", color: "text-red-600 bg-red-50" },
    { href: `/family/patients/${id}/mood`, icon: Smile, label: language === "ar" ? "الحالة المزاجية" : "Humeur", color: "text-amber-600 bg-amber-50" },
    { href: `/family/patients/${id}/activities`, icon: Activity, label: language === "ar" ? "الأنشطة" : "Activités", color: "text-emerald-600 bg-emerald-50" },
    { href: `/family/patients/${id}/preferences`, icon: Heart, label: language === "ar" ? "التفضيلات" : "Préférences", color: "text-pink-600 bg-pink-50" },
    { href: `/family/patients/${id}/history`, icon: History, label: language === "ar" ? "السجل" : "Historique", color: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/family/patients" className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-text">{patient.name}</h1>
          <p className="text-sm text-text-muted">{language === "ar" ? "ملف القريب" : "Profil du proche"}</p>
        </div>
        <Link
          href={`/family/patients`}
          onClick={() => {}}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:opacity-90"
        >
          <Edit2 className="w-4 h-4" />
          <span>{language === "ar" ? "تعديل" : "Modifier"}</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0 overflow-hidden">
            {patient.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
            ) : patient.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-xl font-extrabold text-text">{patient.name}</h2>
            {age !== null && (
              <p className="text-text-muted text-sm font-medium">
                {age} {language === "ar" ? "سنة" : "ans"}
                {patient.birthDate && (
                  <span className="mx-2 text-border">•</span>
                )}
                {patient.birthDate && new Date(patient.birthDate).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR")}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {patient.emergencyPhone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickActions.map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-4 border border-border/60 card-shadow hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-text truncate">{label}</p>
            </div>
            <ChevronIcon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Patient Mode Button */}
      <Link
        href="/family/patient-mode"
        className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl bg-gradient-brand text-white font-extrabold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
      >
        <UserCheck className="w-6 h-6" />
        <span className="flex-1">{language === "ar" ? "تفعيل وضع المريض" : "Activer le Mode Patient"}</span>
        <ChevronIcon className="w-5 h-5 opacity-70" />
      </Link>

      {/* Info Sections */}
      {(patient.dailyHabits || patient.dietPreferences || patient.medicalNotes) && (
        <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
          <h3 className="font-extrabold text-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {language === "ar" ? "معلومات وتفضيلات القريب" : "Informations et préférences"}
          </h3>
          {patient.dailyHabits && (
            <div>
              <p className="text-xs font-extrabold text-text-muted uppercase tracking-wide mb-1">{language === "ar" ? "العادات اليومية والروتين" : "Habitudes et routine quotidienne"}</p>
              <p className="text-sm text-text leading-relaxed">{patient.dailyHabits}</p>
            </div>
          )}
          {patient.dietPreferences && (
            <div>
              <p className="text-xs font-extrabold text-text-muted uppercase tracking-wide mb-1">{language === "ar" ? "التفضيلات الغذائية" : "Préférences alimentaires"}</p>
              <p className="text-sm text-text leading-relaxed">{patient.dietPreferences}</p>
            </div>
          )}
          {patient.medicalNotes && (
            <div>
              <p className="text-xs font-extrabold text-text-muted uppercase tracking-wide mb-1">{language === "ar" ? "معلومات مهمة / ملاحظات العائلة" : "Informations importantes / Notes de la famille"}</p>
              <p className="text-sm text-text leading-relaxed">{patient.medicalNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
