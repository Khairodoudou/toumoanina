"use client";

import Link from "next/link";
import { Heart, MapPin, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Footer() {
  const { t } = useI18n();

  const footerLinks = {
    produit: [
      { href: "/features", label: t.nav.features },
      { href: "/how-it-works", label: t.nav.howItWorks },
      { href: "/faq", label: t.nav.faq },
    ],
    entreprise: [
      { href: "/about", label: t.nav.about },
      { href: "/contact", label: t.nav.contact },
    ],
    legal: [
      { href: "/privacy", label: t.footer.privacy },
      { href: "/terms", label: t.footer.terms },
    ],
  };

  return (
    <footer className="bg-text text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white tracking-tight">
                  ToumAnina
                </span>
                <span className="text-xs text-white/50 font-medium tracking-wider">
                  {t.nav.subtitle}
                </span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              {t.footer.desc}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-mono text-xs">contact@toumoanina.app</span>
              </div>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{t.footer.location}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t.footer.product}
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.produit.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t.footer.company}
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.entreprise.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t.footer.legal}
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs text-center sm:text-left rtl:sm:text-right">
            {t.footer.copyright}
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1.5">
            {t.footer.madeWithLove}
          </p>
        </div>
      </div>
    </footer>
  );
}
