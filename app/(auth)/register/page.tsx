"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Heart,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function RegisterPage() {
  const { t } = useI18n();
  const { user, register, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/family/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (!agreeTerms) {
      setError(t.auth.termsRequired);
      return;
    }

    setLoading(true);

    const result = await register({ name, email, phone, password });
    if (!result.success) {
      setError(result.error || "Erreur lors de l'inscription.");
      setLoading(false);
      return;
    }
    router.push("/family/dashboard");
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl card-shadow border border-border/50 overflow-hidden grid lg:grid-cols-12">
      {/* Form column */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              {t.nav.register}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              {t.auth.registerTitle}
            </h1>
            <p className="text-sm text-text-muted">
              {t.auth.registerSubtitle}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 p-4 rounded-2xl bg-alert/10 border border-alert/20 text-alert text-sm mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5"
              >
                {t.auth.nameLabel} <span className="text-alert">*</span>
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="register-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-2.5 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5"
                >
                  {t.auth.emailLabel} <span className="text-alert">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-2.5 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5 flex items-center justify-between"
                >
                  <span>{t.auth.phoneLabel}</span>
                  <span className="text-[10px] text-text-muted font-normal">
                    {t.auth.phoneOptional}
                  </span>
                </label>
                <div className="relative">
                  <Phone
                    className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.auth.phonePlaceholder}
                    className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-2.5 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5"
                >
                  {t.auth.passwordLabel} <span className="text-alert">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full ltr:pl-11 ltr:pr-11 rtl:pr-11 rtl:pl-11 py-2.5 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-text-muted hover:text-text absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-bold text-text uppercase tracking-wider mb-1.5"
                >
                  {t.auth.confirmPasswordLabel} <span className="text-alert">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-2.5 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      strength >= level
                        ? strength <= 1
                          ? "bg-alert"
                          : strength <= 2
                          ? "bg-accent"
                          : strength <= 3
                          ? "bg-secondary"
                          : "bg-success"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-primary border-border focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-text-muted leading-relaxed">
                  {t.auth.termsAgreement}{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary font-semibold hover:underline"
                  >
                    {t.auth.termsLink}
                  </Link>{" "}
                  {t.auth.and}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary font-semibold hover:underline"
                  >
                    {t.auth.privacyLink}
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-md hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-3"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    aria-hidden="true"
                  />
                  {t.auth.loadingRegister}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  {t.auth.btnRegister}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch to Login */}
        <div className="mt-6 pt-5 border-t border-border/50 text-center text-xs text-text-muted">
          {t.auth.haveAccount}{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline ml-1"
          >
            {t.auth.linkLogin}
          </Link>
        </div>
      </div>

      {/* Brand illustration column */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-brand p-10 flex-col justify-between text-white relative overflow-hidden">
        {/* Background decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"
        />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-sm">
            <Heart className="w-6 h-6 text-white fill-white" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3 leading-snug">
            {t.auth.benefitsTitle}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            {t.home.heroDesc}
          </p>

          <div className="flex flex-col gap-3.5">
            {[
              { title: t.auth.benefit1Title, desc: t.auth.benefit1Desc },
              { title: t.auth.benefit2Title, desc: t.auth.benefit2Desc },
              { title: t.auth.benefit3Title, desc: t.auth.benefit3Desc },
              { title: t.auth.benefit4Title, desc: t.auth.benefit4Desc },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15"
              >
                <CheckCircle
                  className="w-4 h-4 text-white flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">{item.title}</p>
                  <p className="text-[11px] text-white/75 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/20 text-xs text-white/70 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          <span>{t.home.nonMedicalNotice}</span>
        </div>
      </div>
    </div>
  );
}
