"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Shield,
  Sparkles,
  Maximize2,
  Minimize2,
  Navigation,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ContactPage() {
  const { t, language } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapEmbedUrl = `https://maps.google.com/maps?q=Alger,%20Alg%C3%A9rie&t=&z=13&ie=UTF8&iwloc=&output=embed&hl=${
    language === "ar" ? "ar" : "fr"
  }`;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-14 bg-gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
              <Mail className="w-4 h-4" aria-hidden="true" />
              {t.contact.tag}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-5 leading-tight">
              {t.contact.title}{" "}
              <span className="text-gradient">{t.contact.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-2xl">
              {t.contact.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Info + Full Map */}
      <section className="py-12 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Info column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Coordonnées card */}
              <div className="bg-bg rounded-3xl p-7 border border-border/60 card-shadow flex-1">
                <h2 className="font-extrabold text-text text-lg mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                  {t.contact.infoTitle}
                </h2>
                <div className="flex flex-col gap-5">
                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5 font-medium">
                        {t.contact.phoneLabel}
                      </p>
                      <a
                        href="tel:+213549181911"
                        className="text-base font-bold text-text hover:text-primary transition-colors duration-200 font-mono tracking-tight dir-ltr inline-block"
                        dir="ltr"
                      >
                        +213 549 18 19 11
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5 font-medium">
                        {t.contact.emailLabel}
                      </p>
                      <a
                        href="mailto:contact@toumoanina.app"
                        className="text-sm font-semibold text-text hover:text-primary transition-colors duration-200 font-mono"
                      >
                        contact@toumoanina.app
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5 font-medium">
                        {t.contact.locLabel}
                      </p>
                      <p className="text-sm font-semibold text-text">
                        {t.contact.locVal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability card */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
                  <h3 className="font-bold text-text text-sm">
                    {t.contact.delayTitle}
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t.contact.delayDesc}
                </p>
              </div>
            </div>

            {/* Map column - full space */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-bg rounded-3xl p-4 sm:p-5 border border-border/60 card-shadow flex flex-col h-full min-h-[480px]">
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text block">
                        {t.contact.mapTitle}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Alger, Algérie (36.7538° N, 3.0588° E)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fullscreen button */}
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border hover:bg-primary/5 hover:border-primary/40 text-xs font-semibold text-text transition-all duration-150 shadow-xs cursor-pointer"
                      title={language === "ar" ? "عرض الخريطة بملء الشاشة" : "Agrandir en plein écran"}
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-primary" />
                      <span>{language === "ar" ? "ملء الشاشة" : "Plein écran"}</span>
                    </button>

                    {/* Google Maps direct link */}
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Alger+Algerie"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-semibold transition-all duration-150 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Map Container - 100% full width and height with zero blank areas */}
                <div className="relative w-full min-h-[420px] sm:min-h-[480px] flex-1 rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-slate-100">
                  <iframe
                    title={t.contact.mapTitle}
                    src={mapEmbedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {/* Floating map pin overlay badge */}
                  <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 glass-white rounded-2xl p-3 card-shadow z-10 flex items-center gap-3 border border-white/90 max-w-xs shadow-lg">
                    <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-text leading-tight">
                        ToumAnina — طُمَأْنِينَة
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Alger, Algérie (الجزائر العاصمة)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-2 pt-3">
                  <p className="text-xs text-text-muted text-center sm:text-left rtl:sm:text-right">
                    {t.contact.mapDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Map Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Modal Header */}
          <div className="bg-white rounded-2xl px-4 sm:px-6 py-3 mb-3 flex items-center justify-between shadow-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-text text-sm sm:text-base">
                  {t.contact.mapTitle} — ToumAnina (طُمَأْنِينَة)
                </h3>
                <p className="text-xs text-text-muted">
                  Alger, Algérie • 36.7538° N, 3.0588° E
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Alger+Algerie"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Ouvrir Google Maps</span>
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-text font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title={language === "ar" ? "إغلاق" : "Fermer"}
              >
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === "ar" ? "تصغير" : "Fermer le plein écran"}
                </span>
              </button>
            </div>
          </div>

          {/* Modal Map View - 100% full height & width */}
          <div className="relative flex-1 w-full bg-slate-100 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <iframe
              title={t.contact.mapTitle}
              src={mapEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </>
  );
}
