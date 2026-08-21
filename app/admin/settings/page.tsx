"use client";

import { useState, useEffect } from "react";
import {
  Settings, User, Key, Shield, Smartphone,
  CheckCircle, AlertCircle, Loader2, Lock,
  Globe, Database, Server, Info,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AdminSettingsPage() {
  const { t, language } = useI18n();
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState<"account" | "app" | "security">("account");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: t.auth.passwordMismatch });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur" });
      } else {
        setMessage({ type: "success", text: t.admin.savedSuccess });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await refreshUser();
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          {t.admin.settingsTitle}
        </h1>
        <p className="text-sm text-text-muted mt-1">{t.admin.settingsSubtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setTab("account")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === "account"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.admin.tabAccount}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("app")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === "app"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-slate-100"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{t.admin.tabApp}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("security")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            tab === "security"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-text-muted hover:text-text hover:bg-slate-100"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t.admin.tabSecurity}</span>
        </button>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab: Mon compte */}
      {tab === "account" && (
        <form onSubmit={handleSaveAccount} className="bg-white rounded-3xl p-6 sm:p-8 border border-border/60 card-shadow space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/40">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-lg">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text">{user?.name}</h3>
              <p className="text-xs text-text-muted font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-text mb-1 block">{t.admin.fieldName} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-text mb-1 block">{t.admin.fieldEmail}</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-text mb-1 block">{t.admin.colPhone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 space-y-4">
            <h4 className="font-extrabold text-sm text-text flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              {language === "ar" ? "تغيير كلمة المرور" : "Changer le mot de passe"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-text mb-1 block">{t.admin.fieldCurrentPassword}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="font-bold text-text mb-1 block">{t.admin.fieldNewPassword}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="font-bold text-text mb-1 block">{t.admin.fieldConfirmPassword}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/40">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t.admin.btnSave}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Application */}
      {tab === "app" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/60 card-shadow space-y-6 text-xs">
          <h3 className="font-extrabold text-base text-text flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t.admin.appName} — ToumAnina (طُمَأْنِينَة)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-text-muted font-bold">{t.admin.appVersion}</p>
              <p className="font-extrabold text-sm text-text font-mono">v2.0.0 (Production Ready)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-text-muted font-bold">Environnement</p>
              <p className="font-extrabold text-sm text-emerald-600 font-mono">Next.js 16 App Router</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-text-muted font-bold">{t.admin.appDescription}</p>
            <p className="text-text leading-relaxed font-medium">
              ToumAnina est une plateforme numérique bilingue (Français & Arabe) dédiée à
              l&apos;accompagnement des familles et aidants de personnes atteintes de la maladie
              d&apos;Alzheimer, avec géolocalisation à la demande, mode patient sécurisé, suivi
              d&apos;humeur et activités cognitives stimulantes.
            </p>
          </div>

          {/* Reset Demo Data Action */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-sm text-text">
                {language === "ar" ? "إعادة تعيين البيانات التجريبية" : "Données de démonstration"}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {language === "ar"
                  ? "إعادة تحميل عائلة بن علي التجريبية مع المرضى والتنبيهات والأنشطة"
                  : "Recharger la famille Benali de démo avec patients, alertes et activités"}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch("/api/admin/reset-demo", { method: "POST" });
                  if (res.ok) {
                    setMessage({
                      type: "success",
                      text:
                        language === "ar"
                          ? "تمت إعادة تعيين البيانات التجريبية بنجاح"
                          : "Données de démonstration réinitialisées avec succès",
                    });
                  }
                } catch {
                  setMessage({ type: "error", text: "Erreur" });
                } finally {
                  setSaving(false);
                  setTimeout(() => setMessage(null), 4000);
                }
              }}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all flex-shrink-0 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{language === "ar" ? "إعادة تعيين البيانات" : "Réinitialiser les données"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Sécurité */}
      {tab === "security" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/60 card-shadow space-y-6 text-xs">
          <h3 className="font-extrabold text-base text-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t.admin.tabSecurity}
          </h3>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-text-muted font-bold">{t.admin.securitySessionTimeout}</p>
              <p className="font-extrabold text-sm text-text font-mono">30 jours (JWT Cookie HttpOnly)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-text-muted font-bold">Protection du Compte Principal</p>
              <p className="font-extrabold text-sm text-emerald-600">
                admin@gmail.com (Verrouillé contre la suppression ou rétrogradation)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-blue-900">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{t.admin.securityNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
