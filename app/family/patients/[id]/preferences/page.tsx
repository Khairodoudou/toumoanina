"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart, Save, Loader2, Utensils, Clock, Music } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface PatientPrefs {
  name: string;
  dailyHabits?: string;
  dietPreferences?: string;
  medicalNotes?: string;
}

export default function PatientPreferencesPage() {
  const { id } = useParams<{ id: string }>();
  const { language, isRTL } = useI18n();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [prefs, setPrefs] = useState<PatientPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ dailyHabits: "", dietPreferences: "", medicalNotes: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (res.ok) {
        const d = await res.json();
        const p = d.patient;
        setPrefs(p);
        setForm({
          dailyHabits: p.dailyHabits || "",
          dietPreferences: p.dietPreferences || "",
          medicalNotes: p.medicalNotes || "",
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchData();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/family/patients/${id}`} className="p-2 rounded-xl hover:bg-bg transition-colors">
            <BackIcon className="w-5 h-5 text-text-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              {language === "ar" ? "التفضيلات والعادات" : "Préférences et habitudes"}
            </h1>
            {prefs && <p className="text-sm text-text-muted">{prefs.name}</p>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {saved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold text-center">
              {language === "ar" ? "تم الحفظ بنجاح." : "Enregistré avec succès."}
            </div>
          )}
          <div className="space-y-5">
            {/* Daily Habits */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-3">
              <h2 className="font-extrabold text-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {language === "ar" ? "العادات اليومية" : "Habitudes quotidiennes"}
              </h2>
              <p className="text-xs text-text-muted">
                {language === "ar"
                  ? "وقت الاستيقاظ، الروتين اليومي، الأماكن التي يحب زيارتها..."
                  : "Heure de réveil, routine quotidienne, activités habituelles..."}
              </p>
              <textarea
                value={form.dailyHabits}
                onChange={(e) => setForm((f) => ({ ...f, dailyHabits: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm resize-none"
                placeholder={language === "ar" ? "مثال: يتناول الشاي في المساء..." : "Ex: Prend son thé à 16h au jardin..."}
              />
            </div>

            {/* Diet Preferences */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-3">
              <h2 className="font-extrabold text-text flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary" />
                {language === "ar" ? "التفضيلات الغذائية" : "Alimentation et préférences"}
              </h2>
              <p className="text-xs text-text-muted">
                {language === "ar"
                  ? "الأطعمة المفضلة، التي يجب تجنبها، الحساسيات الغذائية..."
                  : "Aliments préférés, à éviter, allergies alimentaires..."}
              </p>
              <textarea
                value={form.dietPreferences}
                onChange={(e) => setForm((f) => ({ ...f, dietPreferences: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm resize-none"
                placeholder={language === "ar" ? "مثال: نظام غذائي قليل الملح..." : "Ex: Régime peu salé, allergique aux arachides..."}
              />
            </div>

            {/* Medical Notes */}
            <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-3">
              <h2 className="font-extrabold text-text flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                {language === "ar" ? "ملاحظات مهمة" : "Notes importantes"}
              </h2>
              <p className="text-xs text-text-muted">
                {language === "ar"
                  ? "الأدوية، المواعيد الطبية، ملاحظات المتابعة..."
                  : "Médicaments, rendez-vous médicaux, notes de suivi..."}
              </p>
              <textarea
                value={form.medicalNotes}
                onChange={(e) => setForm((f) => ({ ...f, medicalNotes: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm resize-none"
                placeholder={language === "ar" ? "مثال: يتناول دواء يومياً في الساعة 8..." : "Ex: Traitement quotidien à 8h et 20h..."}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-primary text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{language === "ar" ? "حفظ التفضيلات" : "Enregistrer les préférences"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
