"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, User, Mail, Phone, Calendar, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function FamilyProfilePage() {
  const { language } = useI18n();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) { setName(user.name || ""); setPhone(user.phone || ""); }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: language === "ar" ? "تم تحديث الملف الشخصي بنجاح." : "Profil mis à jour avec succès." });
        if (refreshUser) await refreshUser();
      } else {
        const d = await res.json();
        setMessage({ type: "error", text: d.error || "Erreur." });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-3">
          <User className="w-7 h-7 text-primary" />
          {language === "ar" ? "ملفي الشخصي" : "Mon profil"}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {language === "ar" ? "معلومات الحساب الخاص بك." : "Informations de votre compte."}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Read-only info */}
      <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-4">
        <div className="flex items-center gap-3 p-3 bg-bg rounded-2xl">
          <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-muted">Email</p>
            <p className="font-mono font-bold text-text text-sm truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-bg rounded-2xl">
          <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-text-muted">{language === "ar" ? "تاريخ التسجيل" : "Date d'inscription"}</p>
            <p className="font-bold text-text text-sm">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-5">
        <h2 className="font-extrabold text-text">{language === "ar" ? "تعديل المعلومات" : "Modifier mes informations"}</h2>
        <div>
          <label className="block font-bold text-text mb-1.5 text-sm">{language === "ar" ? "الاسم الكامل" : "Nom complet"}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block font-bold text-text mb-1.5 text-sm flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            {language === "ar" ? "الهاتف" : "Téléphone"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-sm font-mono"
            dir="ltr"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{language === "ar" ? "حفظ التغييرات" : "Enregistrer"}</span>
        </button>
      </form>
    </div>
  );
}
