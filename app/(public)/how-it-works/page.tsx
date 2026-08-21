"use client";

import Link from "next/link";
import {
  UserPlus,
  Users,
  Smartphone,
  MapPin,
  Shield,
  Heart,
  Activity,
  LogOut,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HowItWorksPage() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const DirectionalArrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    {
      number: "01",
      icon: <UserPlus className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s1Title,
      description: t.howItWorks.s1Desc,
      actions: [t.howItWorks.s1A1, t.howItWorks.s1A2, t.howItWorks.s1A3],
      color: "text-primary",
      bg: "bg-primary/10",
      number_bg: "bg-primary",
    },
    {
      number: "02",
      icon: <Users className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s2Title,
      description: t.howItWorks.s2Desc,
      actions: [t.howItWorks.s2A1, t.howItWorks.s2A2, t.howItWorks.s2A3],
      color: "text-secondary",
      bg: "bg-secondary/10",
      number_bg: "bg-secondary",
    },
    {
      number: "03",
      icon: <Smartphone className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s3Title,
      description: t.howItWorks.s3Desc,
      actions: [t.howItWorks.s3A1, t.howItWorks.s3A2, t.howItWorks.s3A3],
      color: "text-success",
      bg: "bg-success/10",
      number_bg: "bg-success",
      important: t.howItWorks.s3Note,
    },
    {
      number: "04",
      icon: <MapPin className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s4Title,
      description: t.howItWorks.s4Desc,
      actions: [t.howItWorks.s4A1, t.howItWorks.s4A2, t.howItWorks.s4A3],
      color: "text-accent",
      bg: "bg-accent/10",
      number_bg: "bg-accent",
    },
    {
      number: "05",
      icon: <Shield className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s5Title,
      description: t.howItWorks.s5Desc,
      actions: [t.howItWorks.s5A1, t.howItWorks.s5A2, t.howItWorks.s5A3],
      color: "text-alert",
      bg: "bg-alert/10",
      number_bg: "bg-alert",
    },
    {
      number: "06",
      icon: <Activity className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s6Title,
      description: t.howItWorks.s6Desc,
      actions: [t.howItWorks.s6A1, t.howItWorks.s6A2, t.howItWorks.s6A3],
      color: "text-primary",
      bg: "bg-primary/10",
      number_bg: "bg-primary",
    },
    {
      number: "07",
      icon: <LogOut className="w-6 h-6" aria-hidden="true" />,
      title: t.howItWorks.s7Title,
      description: t.howItWorks.s7Desc,
      actions: [t.howItWorks.s7A1, t.howItWorks.s7A2, t.howItWorks.s7A3],
      color: "text-secondary",
      bg: "bg-secondary/10",
      number_bg: "bg-secondary",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-success/8 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
              <DirectionalArrow className="w-4 h-4" aria-hidden="true" />
              {t.howItWorks.tag}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-6 leading-tight">
              {t.howItWorks.title}{" "}
              <span className="text-gradient">{t.howItWorks.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-2xl">
              {t.howItWorks.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white" aria-label={t.howItWorks.tag}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className="group grid md:grid-cols-[auto_1fr] gap-6 items-start"
                aria-label={`${step.number} — ${step.title}`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-14 h-14 rounded-2xl ${step.number_bg} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                  >
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="w-px h-12 bg-gradient-to-b from-border to-transparent"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="bg-bg rounded-3xl p-7 sm:p-8 border border-border/50 hover:border-primary/20 hover:card-shadow transition-all duration-300 mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs font-extrabold ${step.color} tracking-widest`}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text mb-3">
                    {step.number} — {step.title}
                  </h2>
                  <p className="text-text-muted leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Actions list */}
                  <ul className="flex flex-col gap-2.5 mb-2">
                    {step.actions.map((action) => (
                      <li
                        key={action}
                        className="flex items-start gap-3 text-sm text-text font-medium"
                      >
                        <CheckCircle
                          className={`w-4 h-4 ${step.color} mt-0.5 flex-shrink-0`}
                          aria-hidden="true"
                        />
                        {action}
                      </li>
                    ))}
                  </ul>

                  {/* Important note */}
                  {step.important && (
                    <div className={`mt-5 p-4 rounded-2xl ${step.bg} border border-current/10`}>
                      <p className={`text-xs font-semibold ${step.color} leading-relaxed`}>
                        {step.important}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Demo scenario */}
      <section className="py-20 bg-bg" aria-labelledby="demo-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              {t.howItWorks.demoTag}
            </p>
            <h2
              id="demo-heading"
              className="text-3xl font-extrabold text-text leading-tight"
            >
              {t.howItWorks.demoTitle}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-border/30">
            <div className="flex flex-col gap-4">
              {[
                { time: t.howItWorks.demo1Time, action: t.howItWorks.demo1Action, icon: <MapPin className="w-4 h-4 text-primary" /> },
                { time: t.howItWorks.demo2Time, action: t.howItWorks.demo2Action, icon: <Heart className="w-4 h-4 text-success" /> },
                { time: t.howItWorks.demo3Time, action: t.howItWorks.demo3Action, icon: <Activity className="w-4 h-4 text-accent" /> },
                { time: t.howItWorks.demo4Time, action: t.howItWorks.demo4Action, icon: <Shield className="w-4 h-4 text-alert" /> },
                { time: t.howItWorks.demo5Time, action: t.howItWorks.demo5Action, icon: <Clock className="w-4 h-4 text-secondary" /> },
                { time: t.howItWorks.demo6Time, action: t.howItWorks.demo6Action, icon: <Users className="w-4 h-4 text-primary" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-bg transition-colors duration-200">
                  <span className="text-xs font-bold text-text-muted w-16 flex-shrink-0 mt-0.5 font-mono">
                    {item.time}
                  </span>
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                  <p className="text-sm text-text leading-relaxed font-medium">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-text mb-5">
            {t.howItWorks.readyTitle}
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            {t.howItWorks.readyDesc}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            {t.nav.startFree}
            <ArrowIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
