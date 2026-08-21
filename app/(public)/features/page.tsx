"use client";

import Link from "next/link";
import {
  MapPin,
  Shield,
  Activity,
  Heart,
  Users,
  Lock,
  Bell,
  Smartphone,
  BarChart,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function FeaturesPage() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const featureGroups = [
    {
      category: t.features.catFamily,
      categoryColor: "text-primary",
      categoryBg: "bg-primary/10",
      features: [
        {
          icon: <BarChart className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f1Title,
          description: t.features.f1Desc,
          highlights: [t.features.f1H1, t.features.f1H2, t.features.f1H3],
        },
        {
          icon: <Users className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f2Title,
          description: t.features.f2Desc,
          highlights: [t.features.f2H1, t.features.f2H2, t.features.f2H3],
        },
        {
          icon: <Activity className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f3Title,
          description: t.features.f3Desc,
          highlights: [t.features.f3H1, t.features.f3H2, t.features.f3H3],
        },
        {
          icon: <Heart className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f4Title,
          description: t.features.f4Desc,
          highlights: [t.features.f4H1, t.features.f4H2, t.features.f4H3],
        },
      ],
    },
    {
      category: t.features.catGeo,
      categoryColor: "text-secondary",
      categoryBg: "bg-secondary/10",
      features: [
        {
          icon: <MapPin className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f5Title,
          description: t.features.f5Desc,
          highlights: [t.features.f5H1, t.features.f5H2, t.features.f5H3],
        },
        {
          icon: <Shield className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f6Title,
          description: t.features.f6Desc,
          highlights: [t.features.f6H1, t.features.f6H2, t.features.f6H3],
        },
        {
          icon: <Bell className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f7Title,
          description: t.features.f7Desc,
          highlights: [t.features.f7H1, t.features.f7H2, t.features.f7H3],
        },
      ],
    },
    {
      category: t.features.catPatient,
      categoryColor: "text-success",
      categoryBg: "bg-success/10",
      features: [
        {
          icon: <Smartphone className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f8Title,
          description: t.features.f8Desc,
          highlights: [t.features.f8H1, t.features.f8H2, t.features.f8H3],
        },
        {
          icon: <Lock className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f9Title,
          description: t.features.f9Desc,
          highlights: [t.features.f9H1, t.features.f9H2, t.features.f9H3],
        },
        {
          icon: <Activity className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f10Title,
          description: t.features.f10Desc,
          highlights: [t.features.f10H1, t.features.f10H2, t.features.f10H3],
        },
        {
          icon: <MapPin className="w-5 h-5" aria-hidden="true" />,
          title: t.features.f11Title,
          description: t.features.f11Desc,
          highlights: [t.features.f11H1, t.features.f11H2, t.features.f11H3],
        },
      ],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              {t.features.tag}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-6 leading-tight">
              {t.features.title}{" "}
              <span className="text-gradient">{t.features.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-2xl">
              {t.features.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Feature groups */}
      {featureGroups.map((group) => (
        <section
          key={group.category}
          className="py-20 odd:bg-white even:bg-bg"
          aria-labelledby={`section-${group.category}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
              <div
                className={`px-4 py-2 rounded-full ${group.categoryBg} ${group.categoryColor} text-sm font-bold`}
              >
                {group.category}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {group.features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-3xl p-8 card-shadow border border-border/30 hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${group.categoryBg} flex items-center justify-center ${group.categoryColor} mb-5`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-text text-base mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-5">
                    {feature.description}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-text">
                        <CheckCircle
                          className={`w-3.5 h-3.5 ${group.categoryColor} flex-shrink-0`}
                          aria-hidden="true"
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Non-medical disclaimer */}
      <section className="py-16 bg-text">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield
              className="w-6 h-6 text-primary"
              aria-hidden="true"
            />
            <h2 className="text-xl font-bold text-white">
              {t.features.disclaimerTitle}
            </h2>
          </div>
          <p className="text-white/60 leading-relaxed mb-8">
            {t.features.disclaimerDesc}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            {t.nav.startFree}
            <ArrowIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
