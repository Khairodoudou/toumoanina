"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Target,
  Users,
  Shield,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Globe,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AboutPage() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const values = [
    {
      icon: <Heart className="w-6 h-6" aria-hidden="true" />,
      title: t.about.val1Title,
      description: t.about.val1Desc,
      color: "text-alert",
      bg: "bg-alert/10",
    },
    {
      icon: <Shield className="w-6 h-6" aria-hidden="true" />,
      title: t.about.val2Title,
      description: t.about.val2Desc,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: <Lightbulb className="w-6 h-6" aria-hidden="true" />,
      title: t.about.val3Title,
      description: t.about.val3Desc,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: <Globe className="w-6 h-6" aria-hidden="true" />,
      title: t.about.val4Title,
      description: t.about.val4Desc,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  return (
    <>
      {/* Hero with 2-column layout & Image */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
                <Target className="w-4 h-4" aria-hidden="true" />
                {t.about.tag}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-6 leading-tight">
                {t.about.title}{" "}
                <span className="text-gradient">{t.about.titleHighlight}</span>
              </h1>
              <p className="text-lg sm:text-xl text-text-muted leading-relaxed mb-8">
                {t.about.heroDesc}
              </p>

              {/* Trust pill */}
              <div className="inline-flex items-center gap-3 p-3 px-4 rounded-2xl bg-white/80 border border-border card-shadow">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text">
                    {t.nav.subtitle}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {t.about.approachTag}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Framed Image */}
                <div className="relative p-2 rounded-3xl glass card-shadow-hover overflow-hidden group">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner">
                    <Image
                      src="/images/about-mission.jpg"
                      alt="Moment de partage familial et de sérénité"
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-text/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Floating Love Badge */}
                <div
                  className="absolute -top-4 ltr:-right-4 rtl:-left-4 glass rounded-2xl px-4 py-2.5 card-shadow animate-float z-10 flex items-center gap-3 border border-white/60"
                  aria-hidden="true"
                >
                  <div className="w-8 h-8 rounded-xl bg-alert/15 flex items-center justify-center text-alert flex-shrink-0">
                    <Heart className="w-4 h-4 fill-alert" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text">
                      {t.about.val1Title}
                    </span>
                    <p className="text-[10px] text-text-muted">
                      {t.about.badgeFamilies}
                    </p>
                  </div>
                </div>

                {/* Floating Bilingual Badge */}
                <div
                  className="absolute -bottom-4 ltr:-left-4 rtl:-right-4 glass rounded-2xl px-4 py-2.5 card-shadow animate-float-delayed z-10 flex items-center gap-3 border border-white/60"
                  aria-hidden="true"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text">
                      {t.about.badgeBilingual}
                    </span>
                    <p className="text-[10px] text-text-muted">
                      {t.about.badgeBilingualDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white" aria-labelledby="mission-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                {t.about.approachTag}
              </p>
              <h2
                id="mission-heading"
                className="text-3xl font-extrabold text-text mb-6 leading-tight"
              >
                {t.about.approachTitle}
              </h2>
              <div className="flex flex-col gap-5 text-text-muted leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Users className="w-6 h-6 text-primary" aria-hidden="true" />,
                  title: t.about.badgeFamilies,
                  desc: t.about.badgeFamiliesDesc,
                },
                {
                  icon: <Heart className="w-6 h-6 text-alert" aria-hidden="true" />,
                  title: t.about.badgePatients,
                  desc: t.about.badgePatientsDesc,
                },
                {
                  icon: <Shield className="w-6 h-6 text-success" aria-hidden="true" />,
                  title: t.about.badgeSecure,
                  desc: t.about.badgeSecureDesc,
                },
                {
                  icon: <Globe className="w-6 h-6 text-secondary" aria-hidden="true" />,
                  title: t.about.badgeBilingual,
                  desc: t.about.badgeBilingualDesc,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-bg rounded-2xl p-5 border border-border/50"
                >
                  <div className="mb-3">{item.icon}</div>
                  <p className="font-bold text-text text-sm mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-bg" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              {t.about.valuesTag}
            </p>
            <h2
              id="values-heading"
              className="text-3xl font-extrabold text-text leading-tight"
            >
              {t.about.valuesTitle}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-3xl p-7 card-shadow border border-border/30 flex flex-col gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${value.bg} flex items-center justify-center ${value.color}`}
                >
                  {value.icon}
                </div>
                <div>
                  <h3 className="font-bold text-text mb-2">{value.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-text mb-5">
            {t.about.ctaTitle}
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            {t.about.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
            >
              {t.nav.register}
              <ArrowIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-text font-semibold border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm"
            >
              {t.nav.contact}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
