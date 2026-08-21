"use client";

import Link from "next/link";
import { FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

const sectionsFr = [
  {
    title: "1. Objet",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application web ToumAnina, disponible à l'adresse toumoanina.app.\n\nEn créant un compte, vous acceptez intégralement les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.`,
  },
  {
    title: "2. Description du service",
    content: `ToumAnina est un outil numérique d'accompagnement destiné aux familles et aidants de personnes atteintes de la maladie d'Alzheimer. Il propose notamment :\n\n• Gestion de profils patients (données personnelles, préférences, habitudes).\n• Géolocalisation à la demande via l'appareil du patient.\n• Zone de sécurité (géofencing) et alertes automatiques.\n• Suivi de l'humeur et des activités cognitives.\n• Interface simplifiée pour les patients (Mode Patient).\n\nToumAnina n'est pas un dispositif médical, ne pose aucun diagnostic et ne remplace pas l'avis d'un professionnel de santé.`,
  },
  {
    title: "3. Inscription et compte",
    content: `• L'inscription est ouverte à toute personne majeure souhaitant accompagner un proche atteint d'Alzheimer.\n• Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité survenant sur votre compte.\n• Vous vous engagez à fournir des informations exactes lors de l'inscription.\n• Un compte par famille est recommandé. Chaque compte peut gérer plusieurs profils patients.\n• Vous pouvez demander la suppression de votre compte à tout moment en nous contactant.`,
  },
  {
    title: "4. Utilisation acceptable",
    content: `Vous vous engagez à utiliser ToumAnina exclusivement dans le cadre d'un accompagnement bienveillant de proches atteints d'Alzheimer.\n\nIl est strictement interdit de :\n• Utiliser l'application à des fins de surveillance abusive ou de contrôle non consenti.\n• Tenter d'accéder aux données d'autres familles.\n• Introduire des codes malveillants ou tenter de compromettre la sécurité du service.\n• Usurper l'identité d'un autre utilisateur.\n• Utiliser le service à des fins commerciales sans autorisation préalable.`,
  },
  {
    title: "5. Données personnelles et responsabilités",
    content: `Vous êtes responsable des données que vous saisissez concernant votre proche. Vous attestez avoir informé votre proche et, le cas échéant, obtenu son consentement pour l'utilisation de ses données dans l'application.\n\nToumAnina s'engage à protéger vos données conformément à sa Politique de Confidentialité.`,
  },
  {
    title: "6. Géolocalisation et consentement",
    content: `La fonctionnalité de localisation repose sur la Geolocation API du navigateur, qui nécessite une autorisation explicite de l'utilisateur de l'appareil. Vous vous engagez à :\n\n• N'activer le Mode Patient que sur l'appareil physiquement tenu par votre proche.\n• Informer votre proche de la fonctionnalité de localisation et obtenir son accord.\n• Ne pas utiliser la localisation à des fins non liées à la sécurité et au bien-être de votre proche.`,
  },
  {
    title: "7. Disponibilité du service",
    content: `ToumAnina est fourni « en l'état ». Nous nous efforçons d'assurer la disponibilité du service, mais ne garantissons pas une disponibilité ininterrompue. Des maintenances peuvent entraîner des interruptions temporaires.\n\nL'application nécessite une connexion internet et un navigateur web moderne (compatible avec la Geolocation API). En production, une connexion HTTPS est obligatoire pour la fonctionnalité de localisation.`,
  },
  {
    title: "8. Limitation de responsabilité",
    content: `ToumAnina ne saurait être tenu responsable :\n\n• Des décisions prises par les familles sur la base des informations affichées.\n• Des défaillances de la Geolocation API du navigateur ou du GPS de l'appareil.\n• Des conséquences d'une utilisation du service contraire aux présentes CGU.\n• Des dommages indirects liés à l'utilisation ou à l'impossibilité d'utiliser le service.\n\nL'application est un outil d'accompagnement — elle ne remplace pas la présence humaine ni le suivi médical professionnel.`,
  },
  {
    title: "9. Propriété intellectuelle",
    content: `L'ensemble des éléments constituant ToumAnina (code source, design, logo, contenus) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, modification ou utilisation non autorisée est interdite.`,
  },
  {
    title: "10. Modifications des CGU",
    content: `Nous nous réservons le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, vous serez notifié par email. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.`,
  },
  {
    title: "11. Loi applicable",
    content: `Les présentes CGU sont régies par le droit algérien. En cas de litige, les parties s'efforceront de trouver une solution amiable avant tout recours judiciaire.`,
  },
];

const sectionsAr = [
  {
    title: "1. موضوع الاتفاقية",
    content: `تحدد هذه الشروط العامة للاستخدام قواعد الوصول واستخدام تطبيق الويب «طُمَأْنِينَة» المتاح عبر toumoanina.app.\n\nبإنشاء حساب على المنصة، فإنكم توافقون بالكامل على هذه الشروط. إذا لم توافقوا عليها، يرجى الامتناع عن استخدام الخدمة.`,
  },
  {
    title: "2. وصف الخدمة المقدمة",
    content: `طمأنينة أداة رقمية لمرافقة عائلات ومقدمي الرعاية للأشخاص المصابين بمرض الزهايمر. تتيح المنصة:\n\n• إدارة الملفات الشخصية للمرضى (البيانات، التفضيلات، العادات).\n• تحديد الموقع الجغرافي عند الطلب عبر جهاز المريض.\n• تحديد منطقة أمان جغرافية مع تنبيهات تلقائية.\n• متابعة المزاج والأنشطة الذهنية المعرفية.\n• واجهة مبسطة ومريحة للمريض (وضع المريض).\n\nطمأنينة ليس جهازاً طبياً ولا يقدم أي تشخيص ولا يغني عن استشارة الطبيب المختص.`,
  },
  {
    title: "3. التسجيل والحساب",
    content: `• التسجيل متاح لكل شخص راشد يرغب في مرافقة قريب مصاب بالزهايمر.\n• أنتم مسؤولون عن سرية كلمة المرور الخاصة بكم وكافة العمليات المنجزة عبر حسابكم.\n• تلتزمون بتقديم معلومات صحيحة ودقيقة عند التسجيل.\n• يُفضل حساب واحد لكل عائلة، ويمكن للحساب إدارة عدة ملفات لمرضى مختلفين.\n• يمكنكم طلب حذف حسابكم في أي وقت عبر التواصل معنا.`,
  },
  {
    title: "4. الاستخدام المقبول",
    content: `تتعهدون باستخدام طمأنينة حصرياً في إطار المرافقة والرعاية الأسرية الإنسانية.\n\nيُحظر تماماً:\n• استخدام التطبيق للتجسس أو المراقبة غير المصرح بها.\n• محاولة الوصول لبيانات عائلات أخرى.\n• إدخال برمجيات ضارة أو محاولة اختراق خوادم المنصة.\n• انتحال شخصية مستخدم آخر.\n• استخدام التطبيق لأغراض تجارية دون إذن رسمي.`,
  },
  {
    title: "5. البيانات والمسؤوليات",
    content: `أنتم مسؤولون عن صحة البيانات المدخلة بخصوص قريبكم، وتقرون بإعلامه وموافقته على استخدام بياناته لصالحه في التطبيق.\n\nتلتزم طمأنينة بحماية هذه البيانات وفقاً لسياسة الخصوصية المعتمدة.`,
  },
  {
    title: "6. الموقع الجغرافي والموافقة",
    content: `تعتمد ميزة الموقع على واجهة Geolocation API في المتصفح وتتطلب موافقة صريحة من حامل الجهاز. تتعهدون بـ:\n\n• تفعيل وضع المريض فقط على الجهاز المحمول شخصياً من قبل المريض.\n• إعلام قريبكم بميزة الموقع والحصول على موافقته.\n• عدم استغلال الموقع لأي غرض خارج إطار أمان وسلامة القريب.`,
  },
  {
    title: "7. توفر الخدمة والإنترنت",
    content: `تُقدم خدمة طمأنينة «كما هي». نسعى لضمان استقرارها الدائم، ولكن قد تحدث انقطاعات مؤقتة للصيانة والتحديث.\n\nيتطلب التطبيق اتصالاً بالإنترنت ومتصفحاً حديثاً. وفي الإنتاج، يُشترط اتصال HTTPS لتشغيل الموقع الجغرافي.`,
  },
  {
    title: "8. حدود المسؤولية القانونية",
    content: `لا تتحمل إدارة طمأنينة المسؤولية عن:\n\n• القرارات المتخذة من قبل العائلات بناءً على بيانات التطبيق.\n• الأعطال الناتجة عن نظام تحديد المواقع (GPS) في جهاز المستخدم.\n• الاستخدام المخالف لهذه الشروط العامة.\n• الأضرار غير المباشرة الناتجة عن انقطاع الإنترنت أو تعطل الأجهزة.\n\nالتطبيق وسيلة مرافقة مساعدة ولا يغني عن الوجود البشري والرعاية الطبية المتخصصة.`,
  },
  {
    title: "9. الملكية الفكرية",
    content: `كافة عناصر طمأنينة (البرمجيات، الواجهات، الهوية البصرية، الشعار، النصوص) محمية بقوانين الملكية الفكرية. يُمنع أي نسخ أو تعديل دون إذن كتابي مسبق.`,
  },
  {
    title: "10. التعديل على الشروط",
    content: `نحتفظ بالحق في تعديل هذه الشروط عند الحاجة. في حال التعديلات الجوهرية، سيتم إخطاركم عبر البريد الإلكتروني. استمراركم في الاستخدام يُعد قبولاً بالشروط المعدلة.`,
  },
  {
    title: "11. القانون المعمول به",
    content: `تخضع هذه الشروط للقوانين والتشريعات الجزائرية. في حال حدوث أي نزاع، يسعى الطرفان لحله ودياً قبل اللجوء إلى الجهات القضائية المختصة.`,
  },
];

export default function TermsPage() {
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
              <FileText className="w-4 h-4" aria-hidden="true" />
              {t.terms.tag}
            </div>
            <h1 className="text-5xl font-extrabold text-text mb-5 leading-tight">
              {t.terms.title}{" "}
              <span className="text-gradient">{t.terms.titleHighlight}</span>
            </h1>
            <p className="text-text-muted leading-relaxed">
              {t.terms.updated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white" aria-label={t.terms.title}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro */}
          <div className="bg-accent/8 rounded-3xl p-7 border border-accent/20 mb-12">
            <p className="text-sm text-text leading-relaxed">
              <strong>{t.terms.summaryTitle}</strong> {t.terms.summaryText}
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

          {/* Links to related pages */}
          <div className="mt-16 pt-10 border-t border-border flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all duration-200"
            >
              {t.terms.btnPrivacy}
              <ArrowIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-text border border-border rounded-xl hover:bg-bg transition-all duration-200"
            >
              {t.terms.btnContact}
              <ArrowIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
