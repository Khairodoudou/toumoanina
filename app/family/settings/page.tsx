"use client";

import { useState, useEffect } from "react";
import {
  Settings, User, Key, Bell, Shield,
  Save, Check, AlertCircle, Loader2,
  Lock, Smartphone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function SettingsPage() {
  const { t, language } = useI18n();
  const { user, refreshUser } = useAuth();

  const [tab, setTab] = useState<"profile" | "security" | "notifications">("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [pin, setPin] = useState(user?.patientExitPin || "1234");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [notifGeofence, setNotifGeofence] = useState(true);
  const [notifMood, setNotifMood] = useState(true);
  const [notifActivities, setNotifActivities] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setPin(user.patientExitPin || "1234");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    // Simulate saving profile & PIN changes
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          {t.settings.title}
        </h1>
        <p className="text-sm text-text-muted mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-border/50 card-shadow">
        {[
          { key: "profile", label: t.settings.tabProfile, icon: User },
          { key: "security", label: t.settings.tabSecurity, icon: Key },
          { key: "notifications", label: t.settings.tabNotifications, icon: Bell },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              tab === key
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text hover:bg-bg"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Form card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 card-shadow space-y-6">
        {success && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{t.settings.saveSuccess}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Profile */}
        {tab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t.settings.sectionProfileTitle}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text mb-1.5 block">
                  {t.auth.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text mb-1.5 block">
                  {t.auth.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-text mb-1.5 block">
                  {t.auth.phoneLabel}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & PIN */}
        {tab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-text flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-primary" />
                {t.settings.pinTitle}
              </h2>
              <p className="text-xs text-text-muted mb-4">{t.settings.pinDesc}</p>

              <div className="max-w-xs">
                <label className="text-xs font-bold text-text mb-1.5 block">
                  {t.settings.fieldPin}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                  placeholder="1234"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-extrabold text-text flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                {language === "ar" ? "تغيير كلمة المرور" : "Changer le mot de passe"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text mb-1.5 block">
                    {t.settings.fieldCurrentPass}
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text mb-1.5 block">
                    {t.settings.fieldNewPass}
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {tab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-text flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              {t.settings.sectionNotificationsTitle}
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: "geofence",
                  label: t.settings.notifGeofence,
                  checked: notifGeofence,
                  onChange: setNotifGeofence,
                },
                {
                  id: "mood",
                  label: t.settings.notifMood,
                  checked: notifMood,
                  onChange: setNotifMood,
                },
                {
                  id: "activities",
                  label: t.settings.notifActivities,
                  checked: notifActivities,
                  onChange: setNotifActivities,
                },
              ].map(({ id, label, checked, onChange }) => (
                <label
                  key={id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border/50 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-text">{label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-5 h-5 rounded text-primary accent-primary cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-border/50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-md hover:opacity-95 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t.settings.btnSave}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
