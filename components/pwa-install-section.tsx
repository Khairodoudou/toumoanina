"use client";

import React from "react";
import { Smartphone, Zap, Shield, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { PwaInstallButton } from "@/components/pwa-install-button";

export function PwaInstallSection() {
  const { t, isRTL, language } = useI18n();

  return (
    <section
      id="pwa-install"
      className="py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-bg via-surface to-bg"
      aria-labelledby="pwa-section-title"
    >
      {/* Background ambient blurs */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-primary/6 blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-secondary/8 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-surface rounded-3xl p-8 sm:p-12 lg:p-14 border border-border/80 shadow-card hover:shadow-card-hover transition-shadow duration-300">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>{t.pwa.tag}</span>
            </div>

            {/* Title */}
            <h2
              id="pwa-section-title"
              className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight leading-tight"
            >
              {t.pwa.title}
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-text-muted leading-relaxed">
              {t.pwa.desc}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 pb-2 text-left rtl:text-right">
              <div className="p-4 rounded-2xl bg-bg/80 border border-border/50 flex items-center sm:flex-col sm:items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text">
                    {language === "ar" ? "وصول فوري" : "Accès instantané"}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                    {language === "ar"
                      ? "بنقرة واحدة من شاشتك الرئيسية"
                      : "En 1 clic depuis votre écran"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-bg/80 border border-border/50 flex items-center sm:flex-col sm:items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text">
                    {language === "ar" ? "تجربة تطبيق كاملة" : "Expérience fluide"}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                    {language === "ar"
                      ? "شاشة كاملة وبدون شريط متصفح"
                      : "Plein écran sans barre de navigation"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-bg/80 border border-border/50 flex items-center sm:flex-col sm:items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/20 text-text flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text">
                    {language === "ar" ? "خفيف وآمن" : "Léger et sécurisé"}
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                    {language === "ar"
                      ? "بدون استهلاك مساحة الذاكرة"
                      : "Sans téléchargement lourd"}
                  </p>
                </div>
              </div>
            </div>

            {/* Install Button Component */}
            <div className="pt-4 flex justify-center">
              <PwaInstallButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PwaInstallSection;
