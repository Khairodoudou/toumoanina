"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail, Lock, Eye, EyeOff, LogIn, Shield,
  Heart, CheckCircle, AlertCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const { t, isRTL } = useI18n();
  const { user, login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/family/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.error || "Erreur de connexion.");
      setLoading(false);
      return;
    }

    router.push(result.redirectUrl || "/family/dashboard");
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl card-shadow border border-border/50 overflow-hidden grid lg:grid-cols-12">
      {/* Form column */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              {t.nav.login}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
              {t.auth.loginTitle}
            </h1>
            <p className="text-sm text-text-muted">{t.auth.loginSubtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-text uppercase tracking-wider mb-2">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-text uppercase tracking-wider mb-2">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full ltr:pl-11 ltr:pr-11 rtl:pr-11 rtl:pl-11 py-3 rounded-xl bg-bg border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-text-muted hover:text-text absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-md hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                  {t.auth.loadingLogin}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  {t.auth.btnLogin}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-text-muted">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="font-bold text-primary hover:underline ml-1">
            {t.auth.linkRegister}
          </Link>
        </div>
      </div>

      {/* Brand illustration column */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-brand p-10 flex-col justify-between text-white relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-sm">
            <Heart className="w-6 h-6 text-white fill-white" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3 leading-snug">{t.auth.benefitsTitle}</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8">{t.home.heroDesc}</p>

          <div className="flex flex-col gap-4">
            {[
              { title: t.auth.benefit1Title, desc: t.auth.benefit1Desc },
              { title: t.auth.benefit2Title, desc: t.auth.benefit2Desc },
              { title: t.auth.benefit3Title, desc: t.auth.benefit3Desc },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15">
                <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" aria-hidden="true" />
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
