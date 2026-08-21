"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  Smartphone,
  Laptop,
  X,
  HelpCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallButton({
  className = "",
  variant = "primary",
}: {
  className?: string;
  variant?: "primary" | "outline";
}) {
  const { t, language, isRTL } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("android");

  // Detect platform & standalone mode
  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect device platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIos) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuideModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register service worker in production, or unregister in development to avoid router conflicts
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        // Unregister any active dev service worker
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isInstalled) {
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch {
        // Fallback to guide modal if prompt fails
        setShowGuideModal(true);
      }
    } else {
      // Prompt not natively available (e.g. iOS Safari, or already prompted)
      setShowGuideModal(true);
    }
  }, [deferredPrompt, isInstalled]);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className={`relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold rounded-2xl shadow-lg transition-all duration-300 active:scale-98 cursor-pointer ${
            isInstalled
              ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-300 shadow-sm cursor-default"
              : variant === "primary"
              ? "bg-gradient-brand text-white hover:opacity-95 hover:shadow-primary/25 shadow-md"
              : "bg-surface text-primary border-2 border-primary hover:bg-primary/5"
          } ${className}`}
          aria-label={isInstalled ? t.pwa.btnInstalled : t.pwa.btnInstall}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{t.pwa.btnInstalled}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 flex-shrink-0" />
              <span>{t.pwa.btnInstall}</span>
            </>
          )}
        </button>

        <p className="text-xs text-text-muted text-center max-w-sm font-normal">
          {t.pwa.subtext}
        </p>
      </div>

      {/* Instructional Modal for iOS or manual install */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border space-y-6 relative text-text text-left rtl:text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="pwa-guide-title" className="text-lg font-bold text-text">
                    {t.pwa.modalTitle}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t.pwa.modalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-text-muted hover:text-text p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                aria-label={t.pwa.closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps based on platform */}
            <div className="space-y-3 bg-bg p-4 sm:p-5 rounded-2xl border border-border/60 text-sm">
              {platform === "ios" ? (
                <>
                  <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>{t.pwa.iosTitle}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.iosStep1}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.iosStep2}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.iosStep3}
                    </p>
                  </div>
                </>
              ) : platform === "desktop" ? (
                <>
                  <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4" />
                    <span>{t.pwa.desktopTitle}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.desktopStep1}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.desktopStep2}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>{t.pwa.androidTitle}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.androidStep1}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.androidStep2}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <p className="text-xs text-text leading-relaxed">
                      {t.pwa.androidStep3}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {t.pwa.closeModal}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PwaInstallButton;
