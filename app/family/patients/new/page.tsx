"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Save, Loader2, AlertCircle,
  User, Phone, Calendar, Droplets, FileText, Utensils,
  Clock, Heart,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import PatientPhotoUploader from "@/components/patients/PatientPhotoUploader";
import HomeLocationPicker from "@/components/patients/HomeLocationPicker";

const emptyForm = {
  name: "",
  birthDate: "",
  bloodType: "",
  emergencyPhone: "",
  photoUrl: "",
  dailyHabits: "",
  dietPreferences: "",
  medicalNotes: "",
  safeLatitude: "36.7538",
  safeLongitude: "3.0588",
  safeRadiusMeters: "600",
};

export default function NewPatientPage() {
  const { t, language, isRTL } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.emergencyPhone.trim()) {
      setError(language === "ar" ? "الاسم ورقم الهاتف إلزاميان." : "Le nom et le téléphone d'urgence sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          safeLatitude: parseFloat(form.safeLatitude) || 36.7538,
          safeLongitude: parseFloat(form.safeLongitude) || 3.0588,
          safeRadiusMeters: parseInt(form.safeRadiusMeters) || 600,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.");
      } else {
        setSuccess(language === "ar" ? "تم إنشاء الملف بنجاح!" : "Profil créé avec succès !");
        setCreatedId(data.patient?.id || null);
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  if (success && createdId) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center space-y-6 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-text">{success}</h2>
        <p className="text-text-muted text-sm">
          {language === "ar" ? "يمكنك الآن الوصول إلى ملف هذا القريب." : "Vous pouvez maintenant accéder au profil de ce proche."}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/family/patients/${createdId}`}
            className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold text-center"
          >
            {language === "ar" ? "عرض الملف" : "Voir le profil"}
          </Link>
          <Link
            href="/family/patients"
            className="w-full py-3 rounded-2xl bg-bg border border-border font-bold text-text text-center"
          >
            {language === "ar" ? "العودة إلى القائمة" : "Retour à la liste"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/family/patients" className="p-2 rounded-xl hover:bg-bg transition-colors">
          <BackIcon className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            {language === "ar" ? "إضافة قريب" : "Ajouter un proche"}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {language === "ar" ? "أدخل معلومات القريب الذي تودّ متابعته." : "Créez le profil de la personne que vous souhaitez accompagner."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-4">
          <h2 className="font-extrabold text-text flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {language === "ar" ? "المعلومات الشخصية" : "Informations personnelles"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-bold text-text mb-1">
                {language === "ar" ? "الاسم الكامل" : "Nom complet"} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                placeholder={language === "ar" ? "مثال: محمد بن علي" : "Ex: Mohammed Benali"}
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">
                {language === "ar" ? "تاريخ الميلاد" : "Date de naissance"}
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-primary" />
                {language === "ar" ? "هاتف الطوارئ" : "Téléphone d'urgence"} *
              </label>
              <input
                type="tel"
                value={form.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono"
                dir="ltr"
                placeholder="+213 5XX XX XX XX"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <PatientPhotoUploader
                value={form.photoUrl}
                onChange={(url) => handleChange("photoUrl", url)}
                patientName={form.name}
              />
            </div>
          </div>
        </div>

        {/* Habits & Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-4">
          <h2 className="font-extrabold text-text flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            {language === "ar" ? "التفضيلات والعادات" : "Préférences et habitudes"}
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block font-bold text-text mb-1">
                {language === "ar" ? "العادات اليومية والروتين" : "Habitudes et routine quotidienne"}
              </label>
              <textarea
                value={form.dailyHabits}
                onChange={(e) => handleChange("dailyHabits", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                placeholder={language === "ar" ? "مثال: وقت الاستيقاظ، شرب الشاي، المشي..." : "Ex: Heure de réveil, promenade matinale, thé..."}
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">
                {language === "ar" ? "التفضيلات الغذائية" : "Préférences alimentaires"}
              </label>
              <textarea
                value={form.dietPreferences}
                onChange={(e) => handleChange("dietPreferences", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                placeholder={language === "ar" ? "مثال: الأطعمة المفضلة، التي يجب تجنبها..." : "Ex: Aliments préférés, sans sel, allergies..."}
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">
                <FileText className="w-3.5 h-3.5 inline mr-1 text-primary" />
                {language === "ar" ? "معلومات مهمة / ملاحظات العائلة" : "Informations importantes / Notes de la famille"}
              </label>
              <textarea
                value={form.medicalNotes}
                onChange={(e) => handleChange("medicalNotes", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                placeholder={language === "ar" ? "مثال: توجيهات المرافقة، الأوقات المفضلة..." : "Ex: Consignes d'accompagnement, repères importants..."}
              />
            </div>
          </div>
        </div>

        {/* Safe Zone Picker */}
        <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow">
          <HomeLocationPicker
            latitude={form.safeLatitude}
            longitude={form.safeLongitude}
            radius={form.safeRadiusMeters}
            onLocationChange={(lat, lng) =>
              setForm((prev) => ({
                ...prev,
                safeLatitude: String(lat),
                safeLongitude: String(lng),
              }))
            }
            onRadiusChange={(r) =>
              setForm((prev) => ({
                ...prev,
                safeRadiusMeters: String(r),
              }))
            }
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{language === "ar" ? "إنشاء الملف" : "Créer le profil"}</span>
        </button>
      </form>
    </div>
  );
}
