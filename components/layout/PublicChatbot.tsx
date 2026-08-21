"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Heart,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export interface ChatLink {
  label: string;
  href: string;
  icon?: "arrow" | "external" | "features" | "demo" | "contact" | "register";
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  links?: ChatLink[];
  suggestedChips?: string[];
}

interface KnowledgeRule {
  keywordsFr: string[];
  keywordsAr: string[];
  responseFr: string;
  responseAr: string;
  linksFr?: ChatLink[];
  linksAr?: ChatLink[];
  followUpChipsFr?: string[];
  followUpChipsAr?: string[];
}

const KNOWLEDGE_BASE: KnowledgeRule[] = [
  // 1. Qu'est-ce que ToumAnina / Présentation
  {
    keywordsFr: ["toumoanina", "toumanina", "c'est quoi", "qu'est-ce", "présentation", "projet", "mission", "application", "alzheimer", "service"],
    keywordsAr: ["طمانينة", "طمأنينة", "ما هو", "ماهو", "عن التطبيق", "مشروع", "الزهايمر", "تعريف", "فكرة"],
    responseFr:
      "ToumAnina (طُمَأْنِينَة, qui signifie « Sérénité » en arabe) est une plateforme conçue spécialement pour accompagner les personnes atteintes de la maladie d'Alzheimer et apporter de la tranquillité d'esprit à leurs familles et aidants.\n\nElle propose :\n• Un Espace Famille pour le suivi bienveillant et la gestion du quotidien\n• Un Mode Patient sécurisé et ultra-simplifié\n• La localisation à la demande avec alertes hors-zone\n• Des activités de stimulation cognitive adaptées.",
    responseAr:
      "طمأنينة هو تطبيق متكامل ومبتكر صُمم خصيصاً لمرافقة ورعاية مرضى الزهايمر وتوفير راحة البال لعائلاتهم والقائمين على رعايتهم.\n\nيقدم التطبيق :\n• مساحة عائلية للمتابعة الذكية وإدارة الرعاية\n• وضع مريض مبسّط ومؤمّن ومريح\n• تتبعاً جغرافياً عند الطلب مع تنبيهات للمناطق الآمنة\n• أنشطة وتمارين لتحفيز الذاكرة والقدرات الإدراكية.",
    linksFr: [
      { label: "Découvrir les fonctionnalités", href: "/features", icon: "features" },
      { label: "Comment ça marche ?", href: "/how-it-works", icon: "arrow" },
    ],
    linksAr: [
      { label: "استكشاف الميزات", href: "/features", icon: "features" },
      { label: "كيف يعمل التطبيق؟", href: "/how-it-works", icon: "arrow" },
    ],
    followUpChipsFr: ["Mode Patient", "Localisation & GPS", "Activités mémoire", "Essayer la démo"],
    followUpChipsAr: ["وضع المريض", "التتبع والموقع", "تمارين الذاكرة", "تجربة الديمو"],
  },

  // 2. Mode Patient
  {
    keywordsFr: ["mode patient", "patient", "interface patient", "verrouillage", "simplifié", "écran patient", "bouton"],
    keywordsAr: ["وضع المريض", "واجهة المريض", "المريض", "قفل", "شاشة المريض", "تبسيط"],
    responseFr:
      "Le **Mode Patient** de ToumAnina est spécialement étudié pour les personnes âgées ou atteintes de troubles cognitifs :\n\n🔒 **Verrouillage serveur strict** : Le patient ne peut pas quitter l'interface sans le code secret de la famille.\n🔤 **Grand format** : Gros boutons très contrastés, navigation guidée et sans distraction.\n🧩 **Accès direct** : Jeux de mémoire, bouton de partage de localisation en 1 clic et enregistrement d'humeur.",
    responseAr:
      "**وضع المريض** في طمأنينة مصمم بعناية فائقة لكبار السن ومرضى الزهايمر :\n\n🔒 **حماية وقفل مؤمن** : لا يمكن للمريض الخروج من الواجهة إلا برمز سري تحدده العائلة.\n🔤 **واجهة سهلة وواضحة** : أزرار كبيرة وعالية التباين بدون أي تعقيد.\n🧩 **وصول فوري** : ألعاب تنشيط الذاكرة، مشاركة الموقع بنقرة واحدة وتسجيل المشاعر اليومية.",
    linksFr: [
      { label: "Voir les détails du Mode Patient", href: "/features#patient-mode", icon: "features" },
      { label: "Créer un compte", href: "/register", icon: "register" },
    ],
    linksAr: [
      { label: "تفاصيل وضع المريض", href: "/features#patient-mode", icon: "features" },
      { label: "إنشاء حساب الآن", href: "/register", icon: "register" },
    ],
    followUpChipsFr: ["Comment fonctionne le GPS ?", "Quelles activités ?", "Est-ce sécurisé ?"],
    followUpChipsAr: ["كيف يعمل التتبع؟", "ما هي الأنشطة؟", "هل التطبيق آمن؟"],
  },

  // 3. Géolocalisation & Sécurité des zones (Geofencing)
  {
    keywordsFr: ["localisation", "gps", "carte", "zone", "geofencing", "périmètre", "alerte", "retrouver", "perdu", "suivre", "tracking"],
    keywordsAr: ["موقع", "تتبع", "خريطة", "جي بي اس", "منطقة", "أمان", "تنبيه", "خروج", "فقدان", "ضياع", "gps"],
    responseFr:
      "📍 **Localisation respectueuse & sans espionnage permanent** :\n\n• **À la demande** : La position est transmise quand le patient appuie sur le bouton ou sur demande programmée, respectant ainsi sa dignité.\n• **Zone de sécurité (Geofencing)** : La famille peut définir un rayon de sécurité (autour du domicile par exemple). Si le patient en sort, une alerte immédiate est transmise à la famille.\n• **Carte interactive** : Visualisation claire et précise.",
    responseAr:
      "📍 **نظام التتبع الآمن والمحترم للخصوصية** :\n\n• **عند الطلب** : يتم إرسال الموقع عند نقر المريض أو بطلب منظم، دون انتهاك الخصوصية أو التتبع المزعج.\n• **المناطق الآمنة (Geofencing)** : يمكن للعائلة تحديد نطاق آمن (حول المنزل مثلاً)، وفي حال مغادرته يتم إرسال تنبيه فوري للعائلة.\n• **خريطة تفاعلية** : عرض واضح وسريع للموقع على الخريطة.",
    linksFr: [
      { label: "Voir la gestion de localisation", href: "/features", icon: "features" },
      { label: "Tester la démo", href: "/login", icon: "demo" },
    ],
    linksAr: [
      { label: "استعراض ميزة التتبع", href: "/features", icon: "features" },
      { label: "تجربة العرض التوضيحي", href: "/login", icon: "demo" },
    ],
    followUpChipsFr: ["Sécurité des données", "Activités mémoire", "Tarifs"],
    followUpChipsAr: ["حماية البيانات", "أنشطة الذاكرة", "الأسعار"],
  },

  // 4. Activités cognitives & Jeux
  {
    keywordsFr: ["activité", "activités", "jeu", "jeux", "mémoire", "exercice", "cognitif", "stimulation", "photo", "souvenir"],
    keywordsAr: ["أنشطة", "نشاط", "لعبة", "ألعاب", "ذاكرة", "تمارين", "تحفيز", "صور", "ذكريات"],
    responseFr:
      "🧠 **Stimulation cognitive & Jeux personnalisés** :\n\nToumAnina intègre des activités thérapeutiques douces :\n• **Jeux de mémoire** : Reconnaissance visuelle d'animaux, d'objets ou de proches.\n• **Quiz de souvenirs** : Contenus personnalisables par la famille avec les photos des petits-enfants et souvenirs familiaux.\n• **Suivi des scores** : La famille peut suivre l'engagement et les réussites de son proche avec bienveillance.",
    responseAr:
      "🧠 **التحفيز الإدراكي والأنشطة المخصصة** :\n\nتتضمن منصة طمأنينة أنشطة ممتعة ومفيدة للذاكرة :\n• **ألعاب الذاكرة والتركيز** : التعرف على الصور، الحيوانات والأشياء المألوفة.\n• **تخصيص عائلي** : إمكانية إضافة صور أفراد العائلة والذكريات المحببة للمريض.\n• **متابعة الإنجاز** : متابعة تفاعل المريض وتشجيعه المستمر.",
    linksFr: [
      { label: "Découvrir toutes les activités", href: "/features", icon: "features" },
      { label: "Tester avec un compte Démo", href: "/login", icon: "demo" },
    ],
    linksAr: [
      { label: "استعراض جميع الأنشطة", href: "/features", icon: "features" },
      { label: "تجربة الأنشطة في الديمو", href: "/login", icon: "demo" },
    ],
    followUpChipsFr: ["Suivi d'humeur", "Comment s'inscrire ?", "Mode Patient"],
    followUpChipsAr: ["تتبع المزاج", "كيفية التسجيل؟", "وضع المريض"],
  },

  // 5. Suivi de l'humeur
  {
    keywordsFr: ["humeur", "émotion", "sentiment", "triste", "joie", "anxiété", "stress", "calme", "moral"],
    keywordsAr: ["مزاج", "مشاعر", "عاطفة", "حزن", "فرح", "قلق", "توتر", "هدوء", "راحة"],
    responseFr:
      "💛 **Suivi de l'humeur & bien-être émotionnel** :\n\n• Le patient peut exprimer son ressenti simplement via 3 émojis expressifs (Heureux, Neutre, Difficile).\n• Les aidants peuvent ajouter des notes contextuelles.\n• Un historique d'humeur permet à la famille de détecter les variations de moral au fil des jours.",
    responseAr:
      "💛 **متابعة المزاج والحالة النفسية** :\n\n• يمكن للمريض التعبير عن حالته بسهولة من خلال وجوه تعبيرية واضحة ومبسطة.\n• يمكن للعائلة إضافة ملاحظات توضيحية.\n• يتيح السجل الزمني متابعة تطور الحالة المزاجية وتقديم الدعم في الوقت المناسب.",
    linksFr: [{ label: "Voir les fonctionnalités", href: "/features", icon: "arrow" }],
    linksAr: [{ label: "استعراض الميزات", href: "/features", icon: "arrow" }],
    followUpChipsFr: ["Mode Patient", "Sécurité des données", "Créer un compte"],
    followUpChipsAr: ["وضع المريض", "أمان البيانات", "إنشاء حساب"],
  },

  // 6. Tarifs & Gratuité
  {
    keywordsFr: ["gratuit", "prix", "tarif", "payer", "coût", "combien", "abonnement", "achat", "facture"],
    keywordsAr: ["مجاني", "سعر", "أسعار", "تكلفة", "دفع", "اشتراك", "كم السعر", "بكم"],
    responseFr:
      "🎁 **Accès à ToumAnina** :\n\nL'inscription et l'accès de base pour les familles sont accessibles gratuitement afin d'aider le plus grand nombre d'aidants et de familles.\n\nVous pouvez également tester immédiatement la plateforme sans inscription via nos **comptes de démonstration** !",
    responseAr:
      "🎁 **تكلفة واستخدام طمأنينة** :\n\nالتسجيل والاستخدام الأساسي متاح للعائلات لمساعدتهم في مرافقة أحبائهم.\n\nكما يمكنك تجربة كافة ميزات المنصة مجاناً وبشكل فوري عبر **حسابات العرض التوضيحي (الديمو)** دون الحاجة لإنشاء حساب!",
    linksFr: [
      { label: "Créer un compte gratuit", href: "/register", icon: "register" },
      { label: "Tester la démo maintenant", href: "/login", icon: "demo" },
    ],
    linksAr: [
      { label: "إنشاء حساب مجاني", href: "/register", icon: "register" },
      { label: "تجربة الديمو الآن", href: "/login", icon: "demo" },
    ],
    followUpChipsFr: ["Comptes de démo ?", "Comment s'inscrire ?", "Mode Patient"],
    followUpChipsAr: ["حسابات الديمو؟", "كيف أسجل؟", "وضع المريض"],
  },

  // 7. Démo & Essai
  {
    keywordsFr: ["démo", "demo", "tester", "essayer", "compte test", "identifiants", "login", "connexion"],
    keywordsAr: ["ديمو", "تجربة", "حساب تجريبي", "تجريب", "دخول", "بيانات الدخول", "عرض توضيحي"],
    responseFr:
      "✨ **Comptes de Démonstration disponibles immédiatement** :\n\n👨‍👩‍👦 **Espace Famille** :\n• Email : `famille@toumoanina.app`\n• Mot de passe : `famille123`\n\n⚙️ **Espace Administrateur** :\n• Email : `admin@toumoanina.app`\n• Mot de passe : `admin123`\n\nVous pouvez cliquer sur le bouton ci-dessous pour vous connecter en 1 clic !",
    responseAr:
      "✨ **حسابات العرض التوضيحي الجاهزة للتجربة الفورية** :\n\n👨‍👩‍👦 **حساب العائلة (Famille)** :\n• البريد : `famille@toumoanina.app`\n• كلمة المرور : `famille123`\n\n⚙️ **حساب الإدارة (Admin)** :\n• البريد : `admin@toumoanina.app`\n• كلمة المرور : `admin123`\n\nيمكنك الانتقال لصفحة الدخول وتعبئة البيانات بنقرة واحدة!",
    linksFr: [{ label: "Accéder à la page de Connexion", href: "/login", icon: "demo" }],
    linksAr: [{ label: "الانتقال لصفحة الدخول", href: "/login", icon: "demo" }],
    followUpChipsFr: ["Comment fonctionne le mode patient ?", "Qu'est-ce que ToumAnina ?", "Créer un compte"],
    followUpChipsAr: ["كيف يعمل وضع المريض؟", "ما هو طمأنينة؟", "إنشاء حساب"],
  },

  // 8. Inscription & Création de compte
  {
    keywordsFr: ["inscription", "inscrire", "créer un compte", "nouveau compte", "rejoindre", "commencer", "enregistrer"],
    keywordsAr: ["تسجيل", "إنشاء حساب", "حساب جديد", "انضمام", "اشتراك", "بدء"],
    responseFr:
      "📝 **Créer un compte ToumAnina est simple et rapide** :\n\n1. Rendez-vous sur la page d'inscription.\n2. Renseignez votre nom, email et mot de passe.\n3. Vous pourrez ensuite ajouter le profil de votre proche et configurer le Mode Patient en 2 minutes.",
    responseAr:
      "📝 **إنشاء حساب عائلة على طمأنينة سهل وسريع** :\n\n1. توجه إلى صفحة إنشاء الحساب.\n2. أدخل اسمك، بريدك الإلكتروني وكلمة المرور.\n3. ستتمكن فوراً من إضافة ملف قريبك وتفعيل وضع المريض في دقيقتين فقط.",
    linksFr: [
      { label: "Créer mon compte famille", href: "/register", icon: "register" },
      { label: "Voir le guide de démarrage", href: "/how-it-works", icon: "arrow" },
    ],
    linksAr: [
      { label: "إنشاء حساب العائلة الآن", href: "/register", icon: "register" },
      { label: "دليل البدء السريع", href: "/how-it-works", icon: "arrow" },
    ],
    followUpChipsFr: ["Tarifs", "Sécurité des données", "Tester la démo"],
    followUpChipsAr: ["الأسعار", "أمان البيانات", "تجربة الديمو"],
  },

  // 9. Sécurité & Confidentialité
  {
    keywordsFr: ["sécurité", "confidentialité", "données", "médical", "rgpd", "protection", "privé", "secret", "piratage"],
    keywordsAr: ["أمان", "حماية", "خصوصية", "بيانات", "طبي", "سرية", "تشفير"],
    responseFr:
      "🛡️ **Une sécurité et une confidentialité maximales** :\n\n• **Isolation des données** : Chaque famille dispose d'un espace totalement hermétique et sécurisé.\n• **Contrôle côté serveur** : Les accès au mode patient et à l'espace famille sont vérifiés en continu.\n• **Respect de la vie privée** : Vos informations et positions géographiques ne sont jamais revendues ni partagées.",
    responseAr:
      "🛡️ **أعلى معايير الأمان والخصوصية** :\n\n• **عزل تام للبيانات** : بيانات كل عائلة معزولة ومحمية بالكامل ولا يمكن الوصول إليها من أطراف أخرى.\n• **تحقق صارم** : التحقق من الصلاحيات يتم على مستوى الخادم في كل خطوة.\n• **احترام الخصوصية** : معلوماتكم ومواقعكم الجغرافية ملككم وحدكم ولا تتم مشاركتها إطلاقاً.",
    linksFr: [
      { label: "Lire notre Politique de Confidentialité", href: "/privacy", icon: "external" },
      { label: "Conditions d'utilisation", href: "/terms", icon: "external" },
    ],
    linksAr: [
      { label: "سياسة الخصوصية", href: "/privacy", icon: "external" },
      { label: "شروط الاستخدام", href: "/terms", icon: "external" },
    ],
    followUpChipsFr: ["Localisation & GPS", "Mode Patient", "Contacter l'équipe"],
    followUpChipsAr: ["التتبع والموقع", "وضع المريض", "تواصل معنا"],
  },

  // 10. Contact & Support
  {
    keywordsFr: ["contact", "support", "téléphone", "email", "mail", "aide", "question", "assistance", "joindre", "équipe"],
    keywordsAr: ["تواصل", "اتصال", "دعم", "مساعدة", "ايميل", "بريد", "فريق", "هاتف", "استفسار"],
    responseFr:
      "📬 **Notre équipe est à votre écoute !**\n\n• **Email direct** : contact@toumoanina.app\n• **Formulaire en ligne** : Disponible 24/7 sur notre page Contact.\n• **Accompagnement** : Nous répondons à toutes vos questions sous 24h ouvrées.",
    responseAr:
      "📬 **فريق طمأنينة في خدمتكم دائماً !**\n\n• **البريد الإلكتروني** : contact@toumoanina.app\n• **نموذج التواصل** : متاح على مدار الساعة عبر صفحة التواصل.\n• **المساعدة** : نجيب على جميع استفساراتكم واقتراحاتكم في أسرع وقت.",
    linksFr: [
      { label: "Accéder au formulaire de contact", href: "/contact", icon: "contact" },
      { label: "Consulter la Foire Aux Questions (FAQ)", href: "/faq", icon: "arrow" },
    ],
    linksAr: [
      { label: "صفحة التواصل ونموذج المراسلة", href: "/contact", icon: "contact" },
      { label: "الأسئلة الشائعة (FAQ)", href: "/faq", icon: "arrow" },
    ],
    followUpChipsFr: ["Qu'est-ce que ToumAnina ?", "Tester la démo", "Comment s'inscrire ?"],
    followUpChipsAr: ["ما هو تطبيق طمأنينة؟", "تجربة الديمو", "كيفية التسجيل؟"],
  },

  // 11. Salutations & Politesse
  {
    keywordsFr: ["bonjour", "salut", "bonsoir", "coucou", "hello", "hi", "hey", "salam", "marhaba"],
    keywordsAr: ["مرحبا", "سلام", "اهلا", "أهلا", "صباح الخير", "مساء الخير", "السلام عليكم", "أهلاً", "مرحباً"],
    responseFr:
      "Bonjour et bienvenue ! 😊 Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur ToumAnina, le mode patient, la géolocalisation ou tester la démo.",
    responseAr:
      "أهلاً وسهلاً بك في طمأنينة! 🌿 كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن ميزات التطبيق، وضع المريض، التتبع الجغرافي أو تجربة الحساب التجريبي.",
    followUpChipsFr: ["Qu'est-ce que ToumAnina ?", "Comment fonctionne le mode patient ?", "Essayer la démo", "Tarifs"],
    followUpChipsAr: ["ما هو تطبيق طمأنينة؟", "كيف يعمل وضع المريض؟", "تجربة الديمو", "الأسعار"],
  },

  // 12. Remerciements & Au revoir
  {
    keywordsFr: ["merci", "super", "parfait", "au revoir", "bye", "bonne journée", "d'accord", "ok", "top"],
    keywordsAr: ["شكرا", "شكراً", "يعطيك العافية", "تسلم", "ممتاز", "مع السلامة", "باي", "تمام", "حسنا"],
    responseFr:
      "Avec grand plaisir ! 🌿 N'hésitez pas si vous avez d'autres questions. Prenez bien soin de vous et de vos proches.",
    responseAr:
      "على الرحب والسعة دائماً! 🌿 نحن هنا لمساعدتك في أي وقت. نتمنى لك ولعائلتك دوام الصحة والطمأنينة.",
    followUpChipsFr: ["Découvrir les fonctionnalités", "Créer un compte", "Contacter le support"],
    followUpChipsAr: ["استكشاف الميزات", "إنشاء حساب", "التواصل مع الدعم"],
  },
];

function findResponse(query: string, lang: "fr" | "ar"): {
  text: string;
  links?: Message["links"];
  chips?: string[];
} {
  const clean = query.toLowerCase().trim();

  // Score each rule based on keyword matches
  let bestMatch: KnowledgeRule | null = null;
  let highestScore = 0;

  for (const rule of KNOWLEDGE_BASE) {
    let score = 0;
    const keywords = lang === "ar" ? [...rule.keywordsAr, ...rule.keywordsFr] : [...rule.keywordsFr, ...rule.keywordsAr];

    for (const kw of keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      text: lang === "ar" ? bestMatch.responseAr : bestMatch.responseFr,
      links: lang === "ar" ? bestMatch.linksAr : bestMatch.linksFr,
      chips: lang === "ar" ? bestMatch.followUpChipsAr : bestMatch.followUpChipsFr,
    };
  }

  // Fallback if no match
  if (lang === "ar") {
    return {
      text: "شكراً لسؤالك! 🌿 للحصول على إجابة مفصلة أو مرافقة خاصة، يمكنك استعراض ميزات التطبيق، تجربة الحساب التجريبي أو مراسلة فريقنا مباشرة.",
      links: [
        { label: "استكشاف الميزات", href: "/features", icon: "features" },
        { label: "تجربة العرض التوضيحي", href: "/login", icon: "demo" },
        { label: "مراسلة الفريق", href: "/contact", icon: "contact" },
      ],
      chips: ["ما هو تطبيق طمأنينة؟", "وضع المريض", "التتبع والموقع", "الأسعار"],
    };
  }

  return {
    text: "Merci pour votre question ! 🌿 Pour une réponse personnalisée ou une démonstration détaillée, vous pouvez parcourir nos fonctionnalités, essayer la démo ou écrire directement à notre équipe.",
    links: [
      { label: "Découvrir les fonctionnalités", href: "/features", icon: "features" },
      { label: "Tester la démo gratuitement", href: "/login", icon: "demo" },
      { label: "Contacter notre équipe", href: "/contact", icon: "contact" },
    ],
    chips: ["Qu'est-ce que ToumAnina ?", "Mode Patient", "Localisation & GPS", "Tarifs"],
  };
}

export default function PublicChatbot() {
  const { language, isRTL, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const defaultInitialChips =
    language === "ar"
      ? ["ما هو تطبيق طمأنينة؟", "كيف يعمل وضع المريض؟", "هل التتبع الجغرافي آمن؟", "تجربة الحساب التجريبي"]
      : ["Qu'est-ce que ToumAnina ?", "Comment fonctionne le mode patient ?", "Est-ce sécurisé ?", "Tester la démo"];

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize first welcome message
  useEffect(() => {
    const welcomeMsg: Message = {
      id: "init-1",
      sender: "bot",
      text:
        language === "ar"
          ? "مرحباً بكم في **طمأنينة**! 🌿\nأنا **أنيس**، مساعدكم الذكي. يسعدني الإجابة على أي استفسار حول المنصة، وكيف نساعد مرضى الزهايمر وعائلاتهم بكل أمان وطمأنينة."
          : "Bonjour et bienvenue sur **ToumAnina** ! 🌿\nJe suis **Anina**, votre assistante dédiée. Comment puis-je vous renseigner aujourd'hui sur notre accompagnement pour les personnes atteintes d'Alzheimer et leurs familles ?",
      timestamp: new Date().toLocaleTimeString(language === "ar" ? "ar-SA" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      suggestedChips: defaultInitialChips,
      links: [
        {
          label: language === "ar" ? "تجربة الديمو مجاناً" : "Tester la démo gratuitement",
          href: "/login",
          icon: "demo",
        },
        {
          label: language === "ar" ? "استكشاف الميزات" : "Découvrir les fonctionnalités",
          href: "/features",
          icon: "features",
        },
      ],
    };

    setMessages([welcomeMsg]);
  }, [language]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized]);

  // Auto-hide teaser after 12 seconds if unopened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTeaser(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isTyping) return;

    setShowTeaser(false);

    const userTimestamp = new Date().toLocaleTimeString(language === "ar" ? "ar-SA" : "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate smart thinking & typing delay (500ms)
    setTimeout(() => {
      const result = findResponse(query, language);
      const botTimestamp = new Date().toLocaleTimeString(language === "ar" ? "ar-SA" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: result.text,
        timestamp: botTimestamp,
        links: result.links,
        suggestedChips: result.chips,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const handleResetChat = () => {
    const welcomeMsg: Message = {
      id: `init-${Date.now()}`,
      sender: "bot",
      text:
        language === "ar"
          ? "تمت إعادة تعيين المحادثة. كيف يمكنني مساعدتك الآن؟ 🌿"
          : "Conversation réinitialisée. Comment puis-je vous aider ? 🌿",
      timestamp: new Date().toLocaleTimeString(language === "ar" ? "ar-SA" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      suggestedChips: defaultInitialChips,
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isRTL ? "left-4 sm:left-6" : "right-4 sm:right-6"
      } bottom-4 sm:bottom-6`}
    >
      {/* Floating Teaser Bubble (when closed) */}
      {!isOpen && showTeaser && (
        <div
          role="status"
          className={`absolute bottom-16 ${
            isRTL ? "left-0" : "right-0"
          } mb-2 w-72 sm:w-80 bg-surface/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-primary/20 text-text flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t.chatbot.title}
              </span>
              <button
                type="button"
                onClick={() => setShowTeaser(false)}
                className="text-text-muted hover:text-text p-0.5 rounded-full hover:bg-muted transition-colors"
                aria-label={t.chatbot.close}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-2.5">
              {language === "ar"
                ? "مرحباً! هل لديك أي سؤال حول تطبيق طمأنينة أو طريقة استخدامه؟"
                : "Bonjour ! Avez-vous une question sur ToumAnina ou notre mode patient ?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setShowTeaser(false);
              }}
              className="text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>{language === "ar" ? "بدء المحادثة" : "Discuter maintenant"}</span>
              <ArrowIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Button (when closed) */}
      {!isOpen && (
        <div className="relative group">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setShowTeaser(false);
            }}
            className="relative flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-brand text-white rounded-full shadow-2xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 cursor-pointer"
            aria-label={t.chatbot.openChat}
            aria-expanded="false"
          >
            {/* Animated Pulse Ring */}
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-surface animate-ping"
              aria-hidden="true"
            />
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-surface"
              aria-hidden="true"
            />

            <div className="w-6 h-6 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>

            <div className="hidden sm:flex flex-col items-start text-left rtl:items-end rtl:text-right leading-none">
              <span className="text-xs font-bold tracking-tight">
                {language === "ar" ? "مساعد طمأنينة" : "Assistant Anina"}
              </span>
              <span className="text-[10px] text-white/80 font-medium mt-0.5">
                {t.chatbot.online}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window (when open) */}
      {isOpen && (
        <div
          className={`flex flex-col bg-surface rounded-3xl shadow-2xl border border-border/80 overflow-hidden transition-all duration-300 ${
            isMinimized
              ? "w-80 h-16"
              : "w-[92vw] sm:w-[410px] md:w-[440px] h-[580px] max-h-[84vh]"
          }`}
          role="dialog"
          aria-label={t.chatbot.title}
        >
          {/* Header */}
          <div className="bg-gradient-brand text-white px-5 py-3.5 flex items-center justify-between gap-3 select-none flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white shadow-sm"
                  title="En ligne"
                />
              </div>

              <div className="flex flex-col leading-tight min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight truncate">
                    {t.chatbot.title}
                  </span>
                  <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    IA
                  </span>
                </div>
                <span className="text-xs text-white/85 flex items-center gap-1 truncate font-normal mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
                  {t.chatbot.online}
                </span>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1 text-white/90">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title={t.chatbot.clearChat}
                aria-label={t.chatbot.clearChat}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title={t.chatbot.minimize}
                aria-label={t.chatbot.minimize}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMinimized ? "rotate-180" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title={t.chatbot.close}
                aria-label={t.chatbot.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (Messages & Input) if not minimized */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-bg/50">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {/* Intro badge */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-surface/80 px-3 py-1 rounded-full border border-border/50 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    {language === "ar"
                      ? "المساعد التفاعلي لطمأنينة • متاح 24/7"
                      : "Assistant interactif ToumAnina • Disponible 24/7"}
                  </span>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2.5 max-w-[88%] ${
                        msg.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                          msg.sender === "user"
                            ? "bg-text text-white"
                            : "bg-gradient-brand text-white"
                        }`}
                      >
                        {msg.sender === "user" ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Heart className="w-3.5 h-3.5 fill-white" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="flex flex-col gap-1.5">
                        <div
                          className={`p-3.5 rounded-2xl leading-relaxed text-sm shadow-xs ${
                            msg.sender === "user"
                              ? "bg-primary text-white font-medium rounded-tr-xs rtl:rounded-tr-2xl rtl:rounded-tl-xs"
                              : "bg-surface text-text border border-border/70 rounded-tl-xs rtl:rounded-tl-2xl rtl:rounded-tr-xs"
                          }`}
                        >
                          <div className="whitespace-pre-line break-words text-sm">
                            {msg.text.split("\n").map((line, i) => {
                              // Simple bold markup parser (**text**)
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                                  {parts.map((part, pIdx) => {
                                    if (part.startsWith("**") && part.endsWith("**")) {
                                      return (
                                        <strong
                                          key={pIdx}
                                          className={
                                            msg.sender === "user"
                                              ? "font-bold text-white"
                                              : "font-semibold text-primary"
                                          }
                                        >
                                          {part.slice(2, -2)}
                                        </strong>
                                      );
                                    }
                                    return part;
                                  })}
                                </p>
                              );
                            })}
                          </div>

                          {/* Quick Action Links inside Bot Bubble */}
                          {msg.links && msg.links.length > 0 && (
                            <div className="flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-border/50">
                              {msg.links.map((link, lIdx) => (
                                <Link
                                  key={lIdx}
                                  href={link.href}
                                  onClick={() => {
                                    if (window.innerWidth < 640) {
                                      setIsOpen(false);
                                    }
                                  }}
                                  className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold transition-all duration-200 group"
                                >
                                  <span className="truncate">{link.label}</span>
                                  <ArrowIcon className="w-3 h-3 flex-shrink-0 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span
                          className={`text-[10px] text-text-muted px-1 ${
                            msg.sender === "user"
                              ? "text-right rtl:text-left"
                              : "text-left rtl:text-right"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Suggested Chips below specific bot messages */}
                    {msg.suggestedChips && msg.suggestedChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                        {msg.suggestedChips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSendMessage(chip)}
                            className="text-xs font-medium bg-surface hover:bg-primary hover:text-white text-text-muted hover:border-primary border border-border/70 px-3 py-1.5 rounded-full transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 text-left rtl:text-right cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <div className="w-7 h-7 rounded-xl bg-gradient-brand text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-surface border border-border/70 px-3.5 py-2.5 rounded-2xl rounded-tl-xs rtl:rounded-tl-2xl rtl:rounded-tr-xs shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Strip */}
              <div className="p-3 bg-surface/90 border-t border-border/60">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={t.chatbot.placeholder}
                    className="flex-1 bg-bg border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/70 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-gradient-brand text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer"
                    aria-label={t.chatbot.send}
                  >
                    <Send
                      className={`w-4 h-4 ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </form>

                {/* Footer note */}
                <p className="text-[10px] text-text-muted/80 text-center mt-2 truncate">
                  {t.chatbot.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
