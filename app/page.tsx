"use client";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicChatbot from "@/components/layout/PublicChatbot";
import PwaInstallSection from "@/components/pwa-install-section";
import Link from "next/link";
import {
  MapPin,
  Heart,
  Activity,
  Shield,
  Bell,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Clock,
  Smartphone,
  Lock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* ─── Hero ─────────────────────────────────────────────────── */
function HeroSection() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-gradient-hero">
      <div aria-hidden className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl -translate-y-1/4 translate-x-1/3 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      <div aria-hidden className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text content */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary">
              <Heart className="w-4 h-4 fill-primary" aria-hidden />
              {t.home.heroBadge}
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-text leading-[1.15] tracking-tight">
                {t.home.heroTitlePrefix}{" "}
                <span className="text-gradient">{t.home.heroTitleHighlight}</span>
              </h1>
              <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                {t.home.heroDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              {[
                { value: t.home.statGps, label: t.home.statGpsLabel },
                { value: t.home.statBilingual, label: t.home.statBilingualLabel },
                { value: t.home.statSecure, label: t.home.statSecureLabel },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold text-primary">{s.value}</span>
                  <span className="text-sm text-text-muted">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
              >
                {t.home.btnStart}
                <ArrowIcon className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-text font-semibold rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm"
              >
                {t.home.btnHowItWorks}
              </Link>
            </div>

            <p className="text-xs text-text-muted flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" aria-hidden />
              {t.home.nonMedicalNotice}
            </p>
          </div>

          {/* Right — Real Care Scene Photo + Floating Badges */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Outer Glow & Glass Frame */}
              <div className="relative p-2 rounded-3xl glass card-shadow-hover overflow-hidden group">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/hero-family.jpg"
                    alt="Accompagnement bienveillant d'un proche atteint d'Alzheimer"
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-text/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Badge 1 - Top Left/Right: Zone de sécurité */}
              <div
                className="absolute -top-4 ltr:-left-4 rtl:-right-4 glass rounded-2xl px-4 py-2.5 card-shadow animate-float z-10 flex items-center gap-3 border border-white/60"
                aria-hidden="true"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                    <span className="text-xs font-bold text-text">
                      {t.home.previewFloatingSafeZone}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {t.home.previewFloatingSafeZoneDesc}
                  </p>
                </div>
              </div>

              {/* Floating Badge 2 - Bottom: Live Patient Status Card */}
              <div
                className="absolute -bottom-6 ltr:left-4 ltr:right-4 rtl:right-4 rtl:left-4 glass rounded-2xl p-3.5 card-shadow animate-float-delayed z-10 border border-white/60"
                aria-hidden="true"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-xs">
                      {t.home.previewPatientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text leading-tight">
                        {t.home.previewPatientName}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {t.home.previewPatientAge} · {t.home.previewLocVal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/15 text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                      {t.home.previewStatusSafe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem / Solution ────────────────────────────────────── */
function ProblemSection() {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-white" aria-labelledby="problem-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              {t.home.problemTag}
            </p>
            <h2 id="problem-heading" className="text-4xl font-extrabold text-text mb-6 leading-tight">
              {t.home.problemTitle}{" "}
              <span className="text-alert">{t.home.problemTitleHighlight}</span>
            </h2>
            <p className="text-text-muted text-lg leading-relaxed mb-10">
              {t.home.problemDesc}
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: <MapPin className="w-5 h-5" />, text: t.home.problemQ1 },
                { icon: <Heart className="w-5 h-5" />, text: t.home.problemQ2 },
                { icon: <Activity className="w-5 h-5" />, text: t.home.problemQ3 },
                { icon: <Bell className="w-5 h-5" />, text: t.home.problemQ4 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-bg border border-border/50 hover:border-alert/30 hover:bg-alert/5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-alert/10 flex items-center justify-center text-alert flex-shrink-0" aria-hidden>{p.icon}</div>
                  <p className="text-text font-medium text-sm">{p.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="p-1 rounded-3xl bg-gradient-brand">
              <div className="bg-white rounded-[calc(1.5rem-4px)] p-8">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                  {t.home.solutionTag}
                </p>
                <h3 className="text-2xl font-bold text-text mb-4">
                  {t.home.solutionTitle}
                </h3>
                <p className="text-text-muted leading-relaxed mb-6">
                  {t.home.solutionDesc}
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    t.home.solutionP1,
                    t.home.solutionP2,
                    t.home.solutionP3,
                    t.home.solutionP4,
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" aria-hidden />
                      <p className="text-sm text-text">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ──────────────────────────────────────────────── */
function FeaturesSection() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const features = [
    { icon: <MapPin className="w-6 h-6" />, title: t.home.featGpsTitle, description: t.home.featGpsDesc, color: "text-primary", bg: "bg-primary/10" },
    { icon: <Shield className="w-6 h-6" />, title: t.home.featZoneTitle, description: t.home.featZoneDesc, color: "text-secondary", bg: "bg-secondary/10" },
    { icon: <Activity className="w-6 h-6" />, title: t.home.featMoodTitle, description: t.home.featMoodDesc, color: "text-success", bg: "bg-success/10" },
    { icon: <Heart className="w-6 h-6" />, title: t.home.featActTitle, description: t.home.featActDesc, color: "text-accent", bg: "bg-accent/10" },
    { icon: <Users className="w-6 h-6" />, title: t.home.featPatientModeTitle, description: t.home.featPatientModeDesc, color: "text-alert", bg: "bg-alert/10" },
    { icon: <Lock className="w-6 h-6" />, title: t.home.featPrivacyTitle, description: t.home.featPrivacyDesc, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <section className="py-24 bg-bg" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            {t.home.featuresTag}
          </p>
          <h2 id="features-heading" className="text-4xl font-extrabold text-text mb-5 leading-tight">
            {t.home.featuresTitle}{" "}
            <span className="text-gradient">{t.home.featuresTitleHighlight}</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed">{t.home.featuresDesc}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group bg-white rounded-3xl p-7 card-shadow border border-border/30 hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-5 group-hover:scale-110 transition-transform duration-300`} aria-hidden>{f.icon}</div>
              <h3 className="text-base font-bold text-text mb-3">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/features" className="inline-flex items-center gap-2 px-7 py-3.5 text-primary font-semibold border border-primary/30 rounded-2xl hover:bg-primary/5 transition-all duration-200 text-sm">
            {t.home.btnAllFeatures}
            <ArrowIcon className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ──────────────────────────────────────────── */
function HowItWorksSection() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const steps = [
    { number: "01", title: t.home.howStep1Title, description: t.home.howStep1Desc },
    { number: "02", title: t.home.howStep2Title, description: t.home.howStep2Desc },
    { number: "03", title: t.home.howStep3Title, description: t.home.howStep3Desc },
    { number: "04", title: t.home.howStep4Title, description: t.home.howStep4Desc },
  ];

  return (
    <section className="py-24 bg-white" aria-labelledby="how-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            {t.home.howTag}
          </p>
          <h2 id="how-heading" className="text-4xl font-extrabold text-text mb-5 leading-tight">
            {t.home.howTitle} <span className="text-gradient">{t.home.howTitleHighlight}</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col gap-5">
              {i < steps.length - 1 && (
                <div aria-hidden className="hidden lg:block absolute top-7 ltr:left-[calc(100%+1rem)] rtl:right-[calc(100%+1rem)] ltr:right-[-1rem] rtl:left-[-1rem] h-px bg-gradient-to-r from-primary/40 to-transparent" />
              )}
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-lg font-extrabold shadow-md">
                {step.number}
              </div>
              <div>
                <h3 className="font-bold text-text text-base mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link href="/how-it-works" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm">
            {t.home.btnFullGuide}
            <ArrowIcon className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Security ──────────────────────────────────────────────── */
function SecuritySection() {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-text text-white relative overflow-hidden" aria-labelledby="security-heading">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,199,178,0.12),transparent_60%)] pointer-events-none" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(140,200,232,0.08),transparent_60%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              {t.home.secTag}
            </p>
            <h2 id="security-heading" className="text-4xl font-extrabold text-white mb-6 leading-tight">
              {t.home.secTitle}{" "}
              <span className="text-primary">{t.home.secTitleHighlight}</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {t.home.secDesc}
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Lock className="w-4 h-4 text-primary" />, text: t.home.secP1 },
                { icon: <Shield className="w-4 h-4 text-primary" />, text: t.home.secP2 },
                { icon: <Users className="w-4 h-4 text-primary" />, text: t.home.secP3 },
                { icon: <Smartphone className="w-4 h-4 text-primary" />, text: t.home.secP4 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0" aria-hidden>{item.icon}</div>
                  <p className="text-white/80 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right — Realistic Security & Care Scene Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Glass Frame around photo */}
              <div className="relative p-2 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden group">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/security-care.jpg"
                    alt="Sécurité et confidentialité des données familiales"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-text/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Shield Badge Top Right/Left */}
              <div
                className="absolute -top-4 ltr:-right-4 rtl:-left-4 bg-white/90 backdrop-blur-md text-text rounded-2xl px-4 py-2.5 shadow-xl animate-float z-10 flex items-center gap-3 border border-white"
                aria-hidden="true"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text leading-tight">
                    {t.home.statSecure} {t.home.statSecureLabel}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {t.home.secP3}
                  </p>
                </div>
              </div>

              {/* Floating Privacy Badge Bottom Left/Right */}
              <div
                className="absolute -bottom-4 ltr:-left-4 rtl:-right-4 bg-text/90 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-xl animate-float-delayed z-10 flex items-center gap-3 border border-white/20"
                aria-hidden="true"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                    <span className="text-xs font-bold text-white">
                      {t.auth.benefit3Title}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70">
                    HTTPS & JWT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────────── */
function CtaSection() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="py-24 bg-bg" aria-labelledby="cta-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl p-12 card-shadow border border-border/30 relative overflow-hidden">
          <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-brand rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-7 shadow-md">
            <Heart className="w-8 h-8 text-white fill-white" aria-hidden />
          </div>
          <h2 id="cta-heading" className="text-4xl font-extrabold text-text mb-5 leading-tight">
            {t.home.ctaTitle}{" "}
            <span className="text-gradient">{t.home.ctaTitleHighlight}</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-xl mx-auto mb-10">
            {t.home.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              {t.home.ctaBtn}
              <ArrowIcon className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 text-text font-semibold border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
              {t.home.ctaContact}
            </Link>
          </div>
          <p className="text-xs text-text-muted mt-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" aria-hidden />
            {t.home.ctaBadge}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Root Page ─────────────────────────────────────────────── */
export default function RootPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <PwaInstallSection />
        <HowItWorksSection />
        <SecuritySection />
        <CtaSection />
      </main>
      <Footer />
      <PublicChatbot />
    </>
  );
}
