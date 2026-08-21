"use client";

import Link from "next/link";
import { Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const sectionsFr = [
  {
    title: "1. Qui sommes-nous ?",
    content: `ToumAnina est une application web d'accompagnement destinée aux familles et aidants de personnes atteintes de la maladie d'Alzheimer. L'application est développée et opérée en Algérie.\n\nPour toute question relative à la protection de vos données, contactez-nous à : contact@toumoanina.app`,
  },
  {
    title: "2. Données collectées",
    content: `Dans le cadre de votre utilisation de ToumAnina, nous collectons uniquement les données strictement nécessaires au fonctionnement du service :\n\n• Données de compte : nom, adresse email, mot de passe (haché, jamais stocké en clair).\n• Profil patient : nom, prénom, date de naissance, photo (optionnelle), notes, préférences.\n• Données de localisation : latitude, longitude, précision GPS — uniquement lors d'une activation explicite par l'utilisateur. Aucun tracking permanent.\n• Données d'humeur : valeur (bonne/neutre/difficile) et commentaire libre.\n• Résultats d'activités : score et durée des exercices cognitifs.\n• Alertes : historique des notifications générées par le système de géofencing.\n\nNous ne collectons pas de données de santé au sens médical du terme, ni de données biométriques.`,
  },
  {
    title: "3. Finalités du traitement",
    content: `Vos données sont utilisées exclusivement pour :\n\n• Fournir les fonctionnalités de l'application (localisation, suivi d'humeur, activités, alertes).\n• Assurer la sécurité et l'authentification des comptes.\n• Améliorer le service (de manière anonymisée et agrégée uniquement).\n\nVos données ne sont jamais vendues, cédées à des tiers à des fins commerciales, ni utilisées à des fins de publicité ciblée.`,
  },
  {
    title: "4. Base légale",
    content: `Le traitement de vos données repose sur :\n• Votre consentement explicite lors de la création de compte.\n• L'exécution du contrat de service (fourniture des fonctionnalités demandées).\n• Notre intérêt légitime à améliorer la sécurité et la qualité du service.`,
  },
  {
    title: "5. Isolation des données entre familles",
    content: `Chaque compte famille accède uniquement à ses propres données. L'accès aux données d'une autre famille est techniquement impossible — cette isolation est appliquée et vérifiée côté serveur à chaque requête.\n\nLe Mode Patient est également protégé côté serveur : un patient ne peut accéder qu'à son propre espace, et uniquement via une session famille authentifiée.`,
  },
  {
    title: "6. Sécurité des données",
    content: `Nous appliquons les mesures techniques suivantes :\n• Hachage des mots de passe (bcryptjs) — jamais stockés en clair.\n• Authentification par jetons sécurisés (JWT signés).\n• Transmission chiffrée via HTTPS (obligatoire en production).\n• Validation systématique des entrées côté serveur.\n• Secrets et clés en variables d'environnement, jamais exposés côté client.`,
  },
  {
    title: "7. Conservation des données",
    content: `Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte (sur demande), l'ensemble des données associées est supprimé dans un délai de 30 jours.\n\nLes données de localisation sont conservées à des fins d'historique. Vous pouvez demander leur suppression à tout moment via notre formulaire de contact.`,
  },
  {
    title: "8. Vos droits",
    content: `Vous disposez des droits suivants sur vos données :\n• Droit d'accès : consulter l'ensemble des données que nous détenons sur vous.\n• Droit de rectification : corriger des données inexactes.\n• Droit à l'effacement : supprimer votre compte et toutes vos données.\n• Droit à la portabilité : recevoir vos données dans un format structuré.\n• Droit d'opposition : vous opposer à certains traitements.\n\nPour exercer ces droits, contactez-nous à : contact@toumoanina.app`,
  },
  {
    title: "9. Cookies",
    content: `ToumAnina utilise uniquement des cookies fonctionnels nécessaires au maintien de votre session d'authentification (cookie HttpOnly sécurisé). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.`,
  },
  {
    title: "10. Modifications",
    content: `Cette politique peut être mise à jour. En cas de modification substantielle, vous serez notifié par email. La date de dernière mise à jour est indiquée en bas de page.`,
  },
];

const sectionsAr = [
  {
    title: "1. من نحن؟",
    content: `طُمَأْنِينَة هو تطبيق ويب لمرافقة ودعم عائلات ومقدمي الرعاية للأشخاص المصابين بمرض الزهايمر. يتم تطوير وتشغيل التطبيق في الجزائر.\n\nلأي استفسار بخصوص حماية بياناتكم، تواصلوا معنا عبر: contact@toumoanina.app`,
  },
  {
    title: "2. البيانات التي نجمعها",
    content: `في إطار استخدامكم لتطبيق طمأنينة، نجمع فقط البيانات الضرورية لتشغيل الخدمة:\n\n• بيانات الحساب: الاسم، البريد الإلكتروني، كلمة المرور (مشفرة ولا تُخزن كنص واضح).\n• ملف المريض: الاسم، اللقب، تاريخ الميلاد، الصورة (اختيارية)، الملاحظات والتفضيلات.\n• بيانات الموقع: خط العرض، خط الطول، دقة الـ GPS — فقط عند تفعيل المريض للموقع بنفسه. لا يوجد أي تعقب مستمر.\n• بيانات المزاج: القيمة (جيد / محايد / صعب) والتعليق المرفق.\n• نتائج الأنشطة: الدرجة والمدة الزمنية للتمارين الذهنية.\n• التنبيهات: سجل الإشعارات الصادرة عن نظام منطقة الأمان الجغرافية.\n\nنحن لا نجمع أي بيانات طبية بالمعنى التشخيصي ولا أي بيانات بيومترية.`,
  },
  {
    title: "3. أهداف معالجة البيانات",
    content: `تُستخدم بياناتكم حصرياً للأغراض التالية:\n\n• توفير خدمات التطبيق (الموقع، المزاج، الأنشطة، التنبيهات).\n• تأمين الحسابات والتحقق من هوية المستخدمين.\n• تحسين جودة الخدمة (بشكل إحصائي ومجهول الهوية فقط).\n\nلا نقوم أبداً ببيع أو تأجير بياناتكم لأطراف ثالثة أو استخدامها للإعلانات الموجهة.`,
  },
  {
    title: "4. الأساس القانوني",
    content: `تعتمد معالجة بياناتكم على:\n• موافقتكم الصريحة عند إنشاء الحساب.\n• تنفيذ خدمة المرافقة الأسرية المطلوبة.\n• مصلحتنا المشروعة في ضمان أمان واستقرار المنصة.`,
  },
  {
    title: "5. عزل البيانات بين العائلات",
    content: `كل حساب عائلة يصل فقط إلى بيانات مرضاها المسجلين. الوصول إلى بيانات عائلة أخرى مستحيل تقنياً ومفروض خادمياً عند كل عملية طلب.\n\nوضع المريض محمي أيضاً من جهة الخادم: المريض لا يمكنه الدخول إلا لصفحاته المخصصة وفقط عبر جلسة عائلته الموثقة.`,
  },
  {
    title: "6. أمان وحماية البيانات",
    content: `نطبق أعلى التدابير الأمنية المعتمدة عالمياً:\n• تشفير كلمات المرور باستخدام خوارزمية bcryptjs المتقدمة.\n• التوثيق الآمن بالرموز المشفرة (JWT signés).\n• تشفير كامل لجميع الاتصالات عبر بروتوكول HTTPS.\n• التحقق الصارم من صحة المدخلات على مستوى الخادم.\n• حفظ المفاتيح والرموز السرية في بيئة الخادم المشفرة.`,
  },
  {
    title: "7. مدة الاحتفاظ بالبيانات",
    content: `نحتفظ ببياناتكم طالما كان حسابكم نشطاً. عند طلب حذف الحساب، تُحذف كافة البيانات المرتبطة به نهائياً في غضون 30 يوماً.\n\nبيانات المواقع السابقة تُحفظ لأغراض التاريخ، ويمكنكم طلب مسحها في أي وقت عبر التواصل معنا.`,
  },
  {
    title: "8. حقوقكم القانونية",
    content: `تتمتعون بالحقوق الكاملة التالية على بياناتكم:\n• حق الوصول: الاطلاع على كافة البيانات المحفوظة عنكم.\n• حق التصحيح: تعديل أي بيانات غير دقيقة.\n• حق المسح: حذف الحساب وجميع البيانات نهائياً.\n• حق النقل: استخراج بياناتكم في صيغة منظمة.\n• حق الاعتراض: الاعتراض على بعض المعالجات.\n\nلممارسة أي من هذه الحقوق، راسلونا عبر: contact@toumoanina.app`,
  },
  {
    title: "9. ملفات تعريف الارتباط (Cookies)",
    content: `يستخدم تطبيق طمأنينة ملفات تعريف ارتباط وظيفية فقط ضرورية للحفاظ على أمان جلسة تسجيل الدخول (HttpOnly sécurisé). لا نستخدم أي ملفات تتبع إعلانية.`,
  },
  {
    title: "10. التعديلات على السياسة",
    content: `قد نقوم بتحديث هذه السياسة عند الضرورة. في حال حدوث تغييرات جوهرية، سيتم إشعاركم عبر البريد الإلكتروني. تاريخ آخر تحديث موضح في أعلى الصفحة.`,
  },
];

export default function PrivacyPage() {
  const { t, isRTL, language } = useI18n();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const sections = language === "ar" ? sectionsAr : sectionsFr;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-primary text-sm font-semibold text-primary mb-6">
              <Shield className="w-4 h-4" aria-hidden="true" />
              {t.privacy.tag}
            </div>
            <h1 className="text-5xl font-extrabold text-text mb-5 leading-tight">
              {t.privacy.title}{" "}
              <span className="text-gradient">{t.privacy.titleHighlight}</span>
            </h1>
            <p className="text-text-muted leading-relaxed">
              {t.privacy.updated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white" aria-label={t.privacy.title}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro */}
          <div className="bg-primary/8 rounded-3xl p-7 border border-primary/15 mb-12">
            <p className="text-sm text-text leading-relaxed">
              <strong>{t.privacy.summaryTitle}</strong> {t.privacy.summaryText}
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-xl font-bold text-text mb-4">
                  {section.title}
                </h2>
                <div className="text-sm text-text-muted leading-[1.9] whitespace-pre-line">
                  {section.content}
                </div>
              </article>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-16 pt-10 border-t border-border">
            <p className="text-sm text-text-muted mb-5">
              {t.privacy.contactPrompt}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-md transition-all duration-200 text-sm"
            >
              {t.privacy.btnContact}
              <ArrowIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
