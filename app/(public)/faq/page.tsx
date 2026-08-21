"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
  id,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div className="border-b border-border/50 last:border-none">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left rtl:text-right hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
        id={`faq-question-${id}`}
      >
        <span className="text-sm font-semibold text-text leading-relaxed">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-border flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-primary border-primary text-white rotate-180" : "text-text-muted"
          }`}
          aria-hidden="true"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </button>
      <div
        id={`faq-answer-${id}`}
        role="region"
        aria-labelledby={`faq-question-${id}`}
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-text-muted leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { t, isRTL } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const [openId, setOpenId] = useState<string | null>("0-0");

  const faqs = [
    {
      category: t.faq.catGeneral,
      questions: [
        { q: t.faq.q1, a: t.faq.a1 },
        { q: t.faq.q2, a: t.faq.a2 },
        { q: t.faq.q3, a: t.faq.a3 },
        { q: t.faq.q4, a: t.faq.a4 },
      ],
    },
    {
      category: t.faq.catAccount,
      questions: [
        { q: t.faq.q5, a: t.faq.a5 },
        { q: t.faq.q6, a: t.faq.a6 },
        { q: t.faq.q7, a: t.faq.a7 },
      ],
    },
    {
      category: t.faq.catGeo,
      questions: [
        { q: t.faq.q8, a: t.faq.a8 },
        { q: t.faq.q9, a: t.faq.a9 },
        { q: t.faq.q10, a: t.faq.a10 },
        { q: t.faq.q11, a: t.faq.a11 },
      ],
    },
    {
      category: t.faq.catPatientMode,
      questions: [
        { q: t.faq.q12, a: t.faq.a12 },
        { q: t.faq.q13, a: t.faq.a13 },
        { q: t.faq.q14, a: t.faq.a14 },
      ],
    },
    {
      category: t.faq.catSecurity,
      questions: [
        { q: t.faq.q15, a: t.faq.a15 },
        { q: t.faq.q16, a: t.faq.a16 },
        { q: t.faq.q17, a: t.faq.a17 },
      ],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/8 blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              {t.faq.tag}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text mb-5 leading-tight">
              {t.faq.title}{" "}
              <span className="text-gradient">{t.faq.titleHighlight}</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-2xl">
              {t.faq.desc}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-20 bg-white" aria-label={t.faq.tag}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12">
            {faqs.map((category, catIndex) => (
              <div key={category.category}>
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-5">
                  {category.category}
                </h2>
                <div className="bg-bg rounded-3xl px-7 border border-border/50">
                  {category.questions.map((faq, faqIndex) => {
                    const id = `${catIndex}-${faqIndex}`;
                    return (
                      <FaqItem
                        key={id}
                        id={id}
                        q={faq.q}
                        a={faq.a}
                        isOpen={openId === id}
                        onToggle={() =>
                          setOpenId((prev) => (prev === id ? null : id))
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions? */}
      <section className="py-16 bg-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            {t.faq.moreQuestionsTag}
          </p>
          <h2 className="text-2xl font-extrabold text-text mb-4">
            {t.faq.moreQuestionsTitle}
          </h2>
          <p className="text-text-muted mb-7 leading-relaxed">
            {t.faq.moreQuestionsDesc}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            {t.faq.btnContact}
            <ArrowIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
