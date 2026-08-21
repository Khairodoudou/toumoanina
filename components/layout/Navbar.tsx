"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { href: "/about", label: t.nav.about },
    { href: "/features", label: t.nav.features },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/faq", label: t.nav.faq },
    { href: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass nav-shadow py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="ToumAnina — طُمَأْنِينَة"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-text tracking-tight">
                ToumAnina
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase">
                {t.nav.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary rounded-lg hover:bg-primary/8 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/8 transition-all duration-200"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-brand rounded-xl hover:opacity-90 hover:shadow-md transition-all duration-200"
            >
              {t.nav.register}
            </Link>
          </div>

          {/* Mobile menu toggle & Language */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSelector />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-text hover:bg-primary/8 transition-colors duration-200"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/50">
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-text hover:text-primary hover:bg-primary/8 rounded-xl transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-center text-primary border border-primary/30 rounded-xl hover:bg-primary/8 transition-all duration-200"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-sm font-semibold text-center text-white bg-gradient-brand rounded-xl transition-all duration-200"
                >
                  {t.nav.startFree}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
