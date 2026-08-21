"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n, LanguageCode } from "@/lib/i18n/I18nProvider";

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "fr", name: "Français", nativeName: "Français" },
  { code: "ar", name: "Arabe", nativeName: "العربية" },
];

export function LanguageSelector({
  compact = false,
  dropup = false,
}: {
  compact?: boolean;
  dropup?: boolean;
}) {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If compact (e.g. in sidebars), render a clean segmented toggle button
  if (compact) {
    return (
      <div className="w-full flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setLanguage("fr")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            language === "fr"
              ? "bg-white text-text shadow-xs font-extrabold"
              : "text-text-muted hover:text-text"
          }`}
        >
          <span className="text-[11px]">FR</span>
          <span className="text-[11px] font-medium hidden sm:inline">Français</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("ar")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            language === "ar"
              ? "bg-white text-primary shadow-xs font-extrabold"
              : "text-text-muted hover:text-text"
          }`}
        >
          <span className="text-[11px]">AR</span>
          <span className="text-[11px] font-medium">العربية</span>
        </button>
      </div>
    );
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const activeLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-text bg-white/80 hover:bg-white border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Changer de langue / تغيير اللغة"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
        <span className="font-bold text-text uppercase">{activeLang.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute right-0 rtl:right-auto rtl:left-0 w-44 rounded-2xl bg-white shadow-xl border border-border/70 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            dropup ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/40">
            Langue / اللغة
          </div>

          <div className="py-1">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left rtl:text-right font-medium transition-colors duration-150 ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-text hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="uppercase text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-bg text-text-muted">
                      {lang.code}
                    </span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
