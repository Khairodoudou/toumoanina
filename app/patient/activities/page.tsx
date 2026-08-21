"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Gamepad2, Loader2, Play, Trophy, ArrowRight,
  RotateCcw, Clock, Star, User, CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ActivityTemplate {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: "memory_pairs" | "photo_memory" | "number_sequence" | "color_quiz" | "math_easy" | "word_match" | string;
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  isActive: boolean;
}

const DEFAULT_TEMPLATES: ActivityTemplate[] = [
  {
    id: "tpl_1",
    titleFr: "Jeu des paires de mémoire",
    titleAr: "لعبة أزواج الذاكرة",
    descriptionFr: "Retrouvez les paires de cartes pour stimuler la mémoire visuelle et l'attention.",
    descriptionAr: "العثور على أزواج البطاقات المتطابقة لتحفيز الذاكرة البصرية والانتباه.",
    type: "memory_pairs",
    difficulty: "easy",
    durationMinutes: 5,
    isActive: true,
  },
  {
    id: "tpl_2",
    titleFr: "Reconnaissance de photos et souvenirs",
    titleAr: "التعرف على الصور والذكريات",
    descriptionFr: "Identifiez des objets, animaux et éléments familiers du quotidien.",
    descriptionAr: "التعرف على الأشياء والحيوانات والمشاهد اليومية لترسيخ الذاكرة.",
    type: "photo_memory",
    difficulty: "easy",
    durationMinutes: 5,
    isActive: true,
  },
  {
    id: "tpl_3",
    titleFr: "Suite de chiffres",
    titleAr: "تسلسل الأرقام",
    descriptionFr: "Mémorisez puis reproduisez une suite de chiffres simples.",
    descriptionAr: "احفظ تسلسل الأرقام وأعِد إدخالها بالترتيب الصحيح لتدريب التركيز.",
    type: "number_sequence",
    difficulty: "medium",
    durationMinutes: 8,
    isActive: true,
  },
  {
    id: "tpl_4",
    titleFr: "Quiz de couleurs et réflexes",
    titleAr: "اختبار الألوان والتركيز",
    descriptionFr: "Identifiez rapidement la couleur affichée pour stimuler les réflexes cognitifs.",
    descriptionAr: "تعرّف بسرعة على اللون المعروض لتحفيز الانتباه وسرعة الاستجابة.",
    type: "color_quiz",
    difficulty: "easy",
    durationMinutes: 5,
    isActive: true,
  },
  {
    id: "tpl_5",
    titleFr: "Calcul mental facile",
    titleAr: "الحساب الذهني البسيط",
    descriptionFr: "Résolvez des opérations simples de la vie quotidienne (+ et -).",
    descriptionAr: "حل عمليات جمع وطرح يومية بسيطة لتحفيز التفكير المنطقي.",
    type: "math_easy",
    difficulty: "easy",
    durationMinutes: 5,
    isActive: true,
  },
  {
    id: "tpl_6",
    titleFr: "Association d'objets du quotidien",
    titleAr: "مطابقة الأشياء المترابطة",
    descriptionFr: "Associez chaque objet à son usage ou son partenaire habituel.",
    descriptionAr: "اربط كل شيء بما يناسبه في الحياة اليومية (مثل: شاي 🫖 براد).",
    type: "word_match",
    difficulty: "easy",
    durationMinutes: 5,
    isActive: true,
  },
];

/* ─── Game 1: Memory Pairs ─── */
const PAIR_ICONS = ["🌸", "🍎", "🐱", "☀️", "🏠", "🌿"];
interface Card { id: number; icon: string; flipped: boolean; matched: boolean; }

/* ─── Game 2: Photo Memory / Trivia ─── */
const PHOTO_QUESTIONS = [
  {
    icon: "🐱",
    q_fr: "Comment s'appelle l'animal qui miaule ?",
    q_ar: "ما اسم الحيوان الأليف الذي يموء؟",
    a_fr: "Chat",
    a_ar: "قط",
    opts_fr: ["Chat", "Chien", "Oiseau", "Lapin"],
    opts_ar: ["قط", "كلب", "طائر", "أرنب"],
  },
  {
    icon: "☀️",
    q_fr: "Quelle couleur a le ciel lors d'une belle journée ensoleillée ?",
    q_ar: "ما لون السماء في يوم مشمس جميل؟",
    a_fr: "Bleu",
    a_ar: "أزرق",
    opts_fr: ["Rouge", "Bleu", "Vert", "Noir"],
    opts_ar: ["أحمر", "أزرق", "أخضر", "أسود"],
  },
  {
    icon: "🖐️",
    q_fr: "Combien de doigts avons-nous sur une main ?",
    q_ar: "كم إصبعاً في يد واحدة؟",
    a_fr: "5",
    a_ar: "5",
    opts_fr: ["3", "4", "5", "6"],
    opts_ar: ["3", "4", "5", "6"],
  },
  {
    icon: "🍎",
    q_fr: "Quel fruit rouge et croquant est très apprécié ?",
    q_ar: "ما هي الفاكهة الحمراء المقرمشة والمحبوبة؟",
    a_fr: "Pomme",
    a_ar: "تفاحة",
    opts_fr: ["Banane", "Pomme", "Orange", "Raisin"],
    opts_ar: ["موز", "تفاحة", "برتقال", "عنب"],
  },
  {
    icon: "📅",
    q_fr: "Quel jour vient directement après le lundi ?",
    q_ar: "أي يوم يأتي مباشرة بعد يوم الإثنين؟",
    a_fr: "Mardi",
    a_ar: "الثلاثاء",
    opts_fr: ["Dimanche", "Mardi", "Jeudi", "Vendredi"],
    opts_ar: ["الأحد", "الثلاثاء", "الخميس", "الجمعة"],
  },
];

/* ─── Game 3: Number Sequence ─── */
function generateSequence(level: number): number[] {
  const len = 3 + Math.min(level, 2);
  return Array.from({ length: len }, () => Math.floor(Math.random() * 9) + 1);
}

/* ─── Game 4: Color Quiz ─── */
const COLORS = [
  { fr: "Rouge", ar: "أحمر", bg: "#EF4444" },
  { fr: "Bleu", ar: "أزرق", bg: "#3B82F6" },
  { fr: "Vert", ar: "أخضر", bg: "#22C55E" },
  { fr: "Jaune", ar: "أصفر", bg: "#EAB308" },
  { fr: "Violet", ar: "بنفسجي", bg: "#A855F7" },
  { fr: "Orange", ar: "برتقالي", bg: "#F97316" },
];

/* ─── Game 5: Math Easy ─── */
const MATH_QUESTIONS = [
  { q_fr: "2 + 3 = ?", q_ar: "2 + 3 = ؟", a: 5, opts: [4, 5, 6, 7] },
  { q_fr: "4 + 4 = ?", q_ar: "4 + 4 = ؟", a: 8, opts: [7, 8, 9, 10] },
  { q_fr: "10 - 5 = ?", q_ar: "10 - 5 = ؟", a: 5, opts: [3, 4, 5, 6] },
  { q_fr: "6 + 3 = ?", q_ar: "6 + 3 = ؟", a: 9, opts: [8, 9, 10, 11] },
  { q_fr: "8 - 2 = ?", q_ar: "8 - 2 = ؟", a: 6, opts: [5, 6, 7, 8] },
];

/* ─── Game 6: Word / Object Match ─── */
const OBJECT_MATCH_QUESTIONS = [
  {
    icon: "🍵",
    prompt_fr: "Que met-on dans le thé pour le sucrer ?",
    prompt_ar: "ماذا نضع في الشاي لنحلّيه؟",
    a_fr: "Sucre 🍬",
    a_ar: "السكر 🍬",
    opts_fr: ["Sucre 🍬", "Sel 🧂", "Poivre 🌶️", "Huile 🫒"],
    opts_ar: ["السكر 🍬", "الملح 🧂", "الفلفل 🌶️", "الزيت 🫒"],
  },
  {
    icon: "🦶",
    prompt_fr: "Que porte-t-on aux pieds pour marcher dehors ?",
    prompt_ar: "ماذا نلبس في أقدامنا للمشي بالخارج؟",
    a_fr: "Chaussures 👟",
    a_ar: "الحذاء 👟",
    opts_fr: ["Chapeau 🎩", "Chaussures 👟", "Gants 🧤", "Écharpe 🧣"],
    opts_ar: ["قبعة 🎩", "الحذاء 👟", "قفازات 🧤", "وشاح 🧣"],
  },
  {
    icon: "🌧️",
    prompt_fr: "Que prend-on quand il pleut dehors ?",
    prompt_ar: "ماذا نحمل عندما تمطر السماء؟",
    a_fr: "Parapluie ☂️",
    a_ar: "المظلة ☂️",
    opts_fr: ["Lunettes de soleil 🕶️", "Parapluie ☂️", "Éventail 🪭", "T-shirt 👕"],
    opts_ar: ["نظارات شمس 🕶️", "المظلة ☂️", "مروحة يد 🪭", "قميص صيفي 👕"],
  },
  {
    icon: "🪴",
    prompt_fr: "De quoi ont besoin les plantes pour grandir ?",
    prompt_ar: "ماذا تحتاج النباتات لتنمو وتخضرّ؟",
    a_fr: "Eau 💧",
    a_ar: "الماء 💧",
    opts_fr: ["Eau 💧", "Jus 🧃", "Café ☕", "Lait 🥛"],
    opts_ar: ["الماء 💧", "عصير 🧃", "قهوة ☕", "حليب 🥛"],
  },
  {
    icon: "🌙",
    prompt_fr: "Que faisons-nous généralement la nuit ?",
    prompt_ar: "ماذا نفعل عادة في الليل للراحة؟",
    a_fr: "Dormir 💤",
    a_ar: "النوم 💤",
    opts_fr: ["Courir 🏃", "Dormir 💤", "Conduire 🚗", "Nager 🏊"],
    opts_ar: ["الجري 🏃", "النوم 💤", "القيادة 🚗", "السباحة 🏊"],
  },
];

const DIFF_LABEL: Record<string, { fr: string; ar: string; color: string }> = {
  easy:   { fr: "Facile",    ar: "سهل",    color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  medium: { fr: "Moyen",     ar: "متوسط",  color: "text-amber-600 bg-amber-50 border-amber-200" },
  hard:   { fr: "Difficile", ar: "صعب",    color: "text-red-600 bg-red-50 border-red-200" },
};

const TYPE_ICON: Record<string, string> = {
  memory_pairs:    "🃏",
  photo_memory:    "🖼️",
  number_sequence: "🔢",
  color_quiz:      "🎨",
  math_easy:       "➕",
  word_match:      "🔗",
};

export default function PatientActivitiesPage() {
  const { language } = useI18n();
  const router = useRouter();
  const isAr = language === "ar";

  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [templates, setTemplates] = useState<ActivityTemplate[]>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<ActivityTemplate | null>(null);

  // Completed state
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTurns, setFinalTurns] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // memory_pairs state
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [matched, setMatched] = useState(0);

  // photo_memory & trivia state
  const [photoQi, setPhotoQi] = useState(0);
  const [photoScore, setPhotoScore] = useState(0);
  const [photoFeedback, setPhotoFeedback] = useState<"" | "correct" | "wrong">("");

  // number_sequence state
  const [seqPhase, setSeqPhase] = useState<"show" | "input">("show");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [seqLevel, setSeqLevel] = useState(0);
  const [seqCorrect, setSeqCorrect] = useState(0);
  const [seqFeedback, setSeqFeedback] = useState<"" | "correct" | "wrong">("");

  // color_quiz state
  const [colorQuestion, setColorQuestion] = useState<{ color: typeof COLORS[0]; options: typeof COLORS } | null>(null);
  const [colorScore, setColorScore] = useState(0);
  const [colorFeedback, setColorFeedback] = useState<"" | "correct" | "wrong">("");
  const [colorRound, setColorRound] = useState(0);
  const MAX_COLOR_ROUNDS = 6;

  // math_easy state
  const [mathQi, setMathQi] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [mathFeedback, setMathFeedback] = useState<"" | "correct" | "wrong">("");

  // word_match state
  const [matchQi, setMatchQi] = useState(0);
  const [matchScore, setMatchScore] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState<"" | "correct" | "wrong">("");

  // Fetch live templates and active patient
  useEffect(() => {
    const init = async () => {
      try {
        const localActiveId = typeof window !== "undefined" ? localStorage.getItem("toumoanina_active_patient_id") : null;

        const [meRes, tRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/activity-templates", { cache: "no-store" }),
        ]);
        const meData = await meRes.json();
        const pid = localActiveId || meData.user?.activePatientId;
        setPatientId(pid || null);

        if (pid) {
          const pRes = await fetch(`/api/patients/${pid}`, { cache: "no-store" });
          if (pRes.ok) {
            const pData = await pRes.json();
            setPatientName(pData.patient?.name || "");
          }
        } else {
          const pListRes = await fetch("/api/patients", { cache: "no-store" });
          if (pListRes.ok) {
            const pList = await pListRes.json();
            if (pList.patients?.[0]) {
              setPatientId(pList.patients[0].id);
              setPatientName(pList.patients[0].name);
            }
          }
        }

        if (tRes.ok) {
          const tData = await tRes.json();
          const liveList = (tData.templates || []).filter((t: ActivityTemplate) => t.isActive);
          if (liveList.length > 0) {
            setTemplates(liveList);
          }
        }
      } catch {
        // Fallback already preset in DEFAULT_TEMPLATES
      }
    };
    init();
  }, []);

  const startTimer = useCallback(() => {
    setSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // Save result to /api/activities
  const saveResult = useCallback(async (
    actType: string, score: number, finalT: number, finalS: number
  ) => {
    setSaving(true);
    setFinalScore(score);
    setFinalTurns(finalT);
    setFinalSeconds(finalS);
    try {
      if (patientId) {
        await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            activityType: actType,
            score,
            turns: finalT,
            durationSeconds: finalS || 1,
          }),
        });
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setIsCompleted(true);
    }
  }, [patientId]);

  /* ───── COLOR QUIZ HELPER ───── */
  const generateColorQuestion = () => {
    const correct = COLORS[Math.floor(Math.random() * COLORS.length)];
    const wrong = COLORS.filter((c) => c.fr !== correct.fr).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrong, correct].sort(() => Math.random() - 0.5);
    setColorQuestion({ color: correct, options });
  };

  /* ───── START ACTIVITY ───── */
  const startActivity = useCallback((template: ActivityTemplate) => {
    setActive(template);
    setIsCompleted(false);
    setFinalScore(0);
    setFinalTurns(0);
    setFinalSeconds(0);
    startTimer();

    if (template.type === "memory_pairs") {
      const deck: Card[] = [...PAIR_ICONS, ...PAIR_ICONS]
        .sort(() => Math.random() - 0.5)
        .map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
      setCards(deck);
      setFlipped([]);
      setTurns(0);
      setMatched(0);
    } else if (template.type === "photo_memory") {
      setPhotoQi(0);
      setPhotoScore(0);
      setPhotoFeedback("");
    } else if (template.type === "number_sequence") {
      setSeqLevel(0);
      setSeqCorrect(0);
      setSeqFeedback("");
      setUserInput([]);
      const seq = generateSequence(0);
      setSequence(seq);
      setSeqPhase("show");
      setTimeout(() => setSeqPhase("input"), (seq.length + 1) * 850);
    } else if (template.type === "color_quiz") {
      setColorScore(0);
      setColorFeedback("");
      setColorRound(0);
      generateColorQuestion();
    } else if (template.type === "math_easy") {
      setMathQi(0);
      setMathScore(0);
      setMathFeedback("");
    } else if (template.type === "word_match") {
      setMatchQi(0);
      setMatchScore(0);
      setMatchFeedback("");
    }
  }, [startTimer]);

  /* ───── 1. MEMORY PAIRS HANDLER ───── */
  const handleCardClick = (id: number) => {
    if (flipped.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const newTurns = turns + 1;
      setTurns(newTurns);
      const [a, b] = newFlipped;
      const c1 = newCards.find((c) => c.id === a);
      const c2 = newCards.find((c) => c.id === b);

      if (c1 && c2 && c1.icon === c2.icon) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          ));
          setFlipped([]);
          const newMatched = matched + 1;
          setMatched(newMatched);
          if (newMatched === PAIR_ICONS.length) {
            stopTimer();
            const score = Math.max(20, 100 - (newTurns - PAIR_ICONS.length) * 5);
            saveResult("memory_pairs", score, newTurns, seconds);
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
        }, 750);
      }
    }
  };

  /* ───── 2. PHOTO MEMORY / TRIVIA HANDLER ───── */
  const handlePhotoAnswer = (opt: string) => {
    if (photoFeedback !== "") return;
    const currentQ = PHOTO_QUESTIONS[photoQi];
    const correct = (isAr ? opt === currentQ.a_ar : opt === currentQ.a_fr);
    const newScore = photoScore + (correct ? 1 : 0);
    setPhotoScore(newScore);
    setPhotoFeedback(correct ? "correct" : "wrong");

    const nextQi = photoQi + 1;
    setTimeout(() => {
      setPhotoFeedback("");
      if (nextQi >= PHOTO_QUESTIONS.length) {
        stopTimer();
        saveResult("photo_memory", Math.round((newScore / PHOTO_QUESTIONS.length) * 100), PHOTO_QUESTIONS.length, seconds);
      } else {
        setPhotoQi(nextQi);
      }
    }, 700);
  };

  /* ───── 3. NUMBER SEQUENCE HANDLER ───── */
  const handleSeqInput = (digit: number) => {
    if (seqPhase !== "input") return;
    const newInput = [...userInput, digit];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      const correct = newInput.every((v, i) => v === sequence[i]);
      const newCorrect = seqCorrect + (correct ? 1 : 0);
      setSeqCorrect(newCorrect);
      setSeqFeedback(correct ? "correct" : "wrong");

      const newLevel = seqLevel + 1;
      if (newLevel >= 4) {
        stopTimer();
        saveResult("number_sequence", Math.round((newCorrect / 4) * 100), newLevel, seconds);
        return;
      }

      setTimeout(() => {
        setSeqFeedback("");
        setSeqLevel(newLevel);
        setUserInput([]);
        const seq = generateSequence(newLevel);
        setSequence(seq);
        setSeqPhase("show");
        setTimeout(() => setSeqPhase("input"), (seq.length + 1) * 850);
      }, 900);
    }
  };

  /* ───── 4. COLOR QUIZ HANDLER ───── */
  const handleColorAnswer = (chosen: typeof COLORS[0]) => {
    if (!colorQuestion || colorFeedback !== "") return;
    const correct = chosen.fr === colorQuestion.color.fr;
    const newScore = colorScore + (correct ? 1 : 0);
    setColorScore(newScore);
    setColorFeedback(correct ? "correct" : "wrong");

    const newRound = colorRound + 1;
    setColorRound(newRound);

    if (newRound >= MAX_COLOR_ROUNDS) {
      stopTimer();
      setTimeout(() => {
        saveResult("color_quiz", Math.round((newScore / MAX_COLOR_ROUNDS) * 100), newRound, seconds);
      }, 700);
      return;
    }
    setTimeout(() => {
      setColorFeedback("");
      generateColorQuestion();
    }, 700);
  };

  /* ───── 5. MATH EASY HANDLER ───── */
  const handleMathAnswer = (opt: number) => {
    if (mathFeedback !== "") return;
    const currentQ = MATH_QUESTIONS[mathQi];
    const correct = opt === currentQ.a;
    const newScore = mathScore + (correct ? 1 : 0);
    setMathScore(newScore);
    setMathFeedback(correct ? "correct" : "wrong");

    const nextQi = mathQi + 1;
    setTimeout(() => {
      setMathFeedback("");
      if (nextQi >= MATH_QUESTIONS.length) {
        stopTimer();
        saveResult("math_easy", Math.round((newScore / MATH_QUESTIONS.length) * 100), MATH_QUESTIONS.length, seconds);
      } else {
        setMathQi(nextQi);
      }
    }, 700);
  };

  /* ───── 6. WORD / OBJECT MATCH HANDLER ───── */
  const handleMatchAnswer = (opt: string) => {
    if (matchFeedback !== "") return;
    const currentQ = OBJECT_MATCH_QUESTIONS[matchQi];
    const correct = (isAr ? opt === currentQ.a_ar : opt === currentQ.a_fr);
    const newScore = matchScore + (correct ? 1 : 0);
    setMatchScore(newScore);
    setMatchFeedback(correct ? "correct" : "wrong");

    const nextQi = matchQi + 1;
    setTimeout(() => {
      setMatchFeedback("");
      if (nextQi >= OBJECT_MATCH_QUESTIONS.length) {
        stopTimer();
        saveResult("word_match", Math.round((newScore / OBJECT_MATCH_QUESTIONS.length) * 100), OBJECT_MATCH_QUESTIONS.length, seconds);
      } else {
        setMatchQi(nextQi);
      }
    }, 700);
  };

  /* ══════════════════════════════════════════════
     SCREEN 1: GAME COMPLETED WITH SCORE & STARS
  ══════════════════════════════════════════════ */
  if (isCompleted && active) {
    return (
      <div className="max-w-sm mx-auto space-y-6 py-8 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-sm border-4 border-emerald-200 animate-bounce">
          <Trophy className="w-12 h-12 text-emerald-600" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#243B36]">
            {isAr ? "أحسنت! النشاط مكتمل 🎉" : "Activité terminée ! 🎉"}
          </h2>
          <p className="text-sm text-[#4A7065]">
            {isAr ? "تم تسجيل نتيجتك بنجاح ومشاركتها مع العائلة." : "Votre résultat a été enregistré avec succès."}
          </p>
          {saving && (
            <p className="text-xs text-primary flex items-center justify-center gap-1 mt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {isAr ? "جارٍ الحفظ..." : "Enregistrement..."}
            </p>
          )}
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#4A7065] mb-1">
                {isAr ? "النقاط" : "Score"}
              </p>
              <p className="text-3xl font-extrabold text-emerald-700">
                {finalScore}<span className="text-sm text-emerald-500">/100</span>
              </p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-[#4A7065] mb-1">
                {isAr ? "الوقت" : "Durée"}
              </p>
              <p className="text-3xl font-extrabold text-amber-700 font-mono">
                {finalSeconds}<span className="text-sm text-amber-500">s</span>
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 pt-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${finalScore >= star * 30 ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => { setActive(null); setIsCompleted(false); }}
            className="w-full py-4 rounded-2xl border-2 border-[#D8EFE8] text-[#4A7065] font-extrabold text-base flex items-center justify-center gap-2 hover:bg-[#E8F6F1] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isAr ? "اختيار نشاط آخر" : "Choisir une autre activité"}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/patient")}
            className="w-full py-4 rounded-3xl bg-[#63C7B2] text-white font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-[#4AAA97] transition-colors shadow-md cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
            <span>{isAr ? "العودة للرئيسية" : "Retour à l'accueil"}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SCREEN 2: ACTIVE GAME IN PROGRESS
  ══════════════════════════════════════════════ */

  // 1. GAME: Memory Pairs
  if (active?.type === "memory_pairs") {
    return (
      <div className="max-w-sm mx-auto space-y-5 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">
              {isAr ? active.titleAr : active.titleFr}
            </h2>
            <p className="text-xs text-[#4A7065]">
              {isAr ? `الأزواج المكتشفة: ${matched} / ${PAIR_ICONS.length}` : `Paires : ${matched} / ${PAIR_ICONS.length}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] text-[#243B36] px-3 py-1.5 rounded-xl">
              ⏱ {seconds}s
            </span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl text-[#4A7065] hover:bg-slate-100 cursor-pointer">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCardClick(c.id)}
              disabled={c.flipped || c.matched || flipped.length === 2}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-extrabold transition-all duration-300 active:scale-95 shadow-sm border-2 select-none cursor-pointer
                ${c.matched ? "bg-emerald-100 border-emerald-300 opacity-80 scale-95"
                  : c.flipped ? "bg-white border-[#63C7B2]"
                  : "bg-gradient-to-br from-[#63C7B2] to-[#4AAA97] border-[#4AAA97] hover:opacity-90 text-white"}`}
            >
              {c.flipped || c.matched ? c.icon : "❓"}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-[#4A7065] font-semibold">
          🔁 {isAr ? `المحاولات: ${turns}` : `Essais : ${turns}`}
        </p>
      </div>
    );
  }

  // 2. GAME: Photo Memory / Trivia
  if (active?.type === "photo_memory") {
    const q = PHOTO_QUESTIONS[photoQi];
    return (
      <div className="max-w-sm mx-auto space-y-5 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">{isAr ? active.titleAr : active.titleFr}</h2>
            <p className="text-xs text-[#4A7065]">{photoQi + 1} / {PHOTO_QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] px-3 py-1.5 rounded-xl text-[#243B36]">⏱ {seconds}s</span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-[#4A7065] cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-6 text-center space-y-3">
          <span className="text-5xl block select-none">{q.icon}</span>
          <p className="text-lg font-black text-[#243B36] leading-relaxed">
            {isAr ? q.q_ar : q.q_fr}
          </p>
          {photoFeedback && (
            <p className={`text-sm font-bold ${photoFeedback === "correct" ? "text-emerald-600" : "text-rose-500"}`}>
              {photoFeedback === "correct"
                ? (isAr ? "✅ أحسنت! إجابة صحيحة" : "✅ Bravo ! Bonne réponse")
                : (isAr ? `❌ الإجابة الصحيحة هي: ${q.a_ar}` : `❌ La réponse est : ${q.a_fr}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(isAr ? q.opts_ar : q.opts_fr).map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePhotoAnswer(opt)}
              disabled={photoFeedback !== ""}
              className="py-4 rounded-2xl border-2 border-[#D8EFE8] bg-white text-base font-extrabold text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. GAME: Number Sequence
  if (active?.type === "number_sequence") {
    return (
      <div className="max-w-sm mx-auto space-y-6 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">{isAr ? active.titleAr : active.titleFr}</h2>
            <p className="text-xs text-[#4A7065]">{isAr ? `المستوى ${seqLevel + 1} / 4` : `Niveau ${seqLevel + 1} / 4`}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] px-3 py-1.5 rounded-xl text-[#243B36]">⏱ {seconds}s</span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-[#4A7065] cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        {seqPhase === "show" ? (
          <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-8 text-center space-y-4">
            <p className="text-sm font-bold text-[#4A7065]">
              {isAr ? "احفظ هذه الأرقام بالترتيب:" : "Mémorisez ces chiffres :"}
            </p>
            <div className="flex justify-center gap-2.5 flex-wrap">
              {sequence.map((n, i) => (
                <span key={i} className="w-12 h-12 rounded-2xl bg-[#63C7B2] text-white text-2xl font-black flex items-center justify-center shadow">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#4A7065] animate-pulse">{isAr ? "ستختفي بعد لحظات..." : "Ils disparaîtront bientôt..."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-5 text-center">
              <p className="text-xs font-bold text-[#4A7065] mb-2.5">
                {isAr ? "أعد إدخال الأرقام:" : "Tapez les chiffres :"}
              </p>
              <div className="flex justify-center gap-2 flex-wrap mb-2">
                {Array.from({ length: sequence.length }, (_, i) => (
                  <span key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black border-2
                    ${i < userInput.length ? "bg-[#63C7B2] border-[#63C7B2] text-white" : "bg-slate-100 border-slate-200 text-transparent"}`}>
                    {userInput[i] ?? "·"}
                  </span>
                ))}
              </div>
              {seqFeedback && (
                <p className={`text-xs font-bold ${seqFeedback === "correct" ? "text-emerald-600" : "text-rose-500"}`}>
                  {seqFeedback === "correct" ? (isAr ? "✅ ممتاز!" : "✅ Bravo !") : (isAr ? "❌ غير صحيح" : "❌ Incorrect")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button key={d} type="button" onClick={() => handleSeqInput(d)}
                  disabled={seqFeedback !== ""}
                  className="py-3.5 rounded-2xl bg-white border-2 border-[#D8EFE8] text-2xl font-black text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-2xs cursor-pointer">
                  {d}
                </button>
              ))}
              <div />
              <button type="button" onClick={() => handleSeqInput(0)}
                disabled={seqFeedback !== ""}
                className="py-3.5 rounded-2xl bg-white border-2 border-[#D8EFE8] text-2xl font-black text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-2xs cursor-pointer">
                0
              </button>
              <button type="button" onClick={() => setUserInput((u) => u.slice(0, -1))}
                className="py-3.5 rounded-2xl bg-slate-100 border-2 border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all cursor-pointer">
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. GAME: Color Quiz
  if (active?.type === "color_quiz" && colorQuestion) {
    const { color, options } = colorQuestion;
    return (
      <div className="max-w-sm mx-auto space-y-5 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">{isAr ? active.titleAr : active.titleFr}</h2>
            <p className="text-xs text-[#4A7065]">{colorRound + 1} / {MAX_COLOR_ROUNDS}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] px-3 py-1.5 rounded-xl text-[#243B36]">⏱ {seconds}s</span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-[#4A7065] cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-6 text-center space-y-4 shadow-sm">
          <p className="text-sm font-bold text-[#4A7065]">
            {isAr ? "ما هو هذا اللون؟" : "Quelle est cette couleur ?"}
          </p>
          <div className="w-28 h-28 rounded-3xl mx-auto shadow-md border-4 border-white"
            style={{ backgroundColor: color.bg }} />
          {colorFeedback && (
            <p className={`text-base font-black ${colorFeedback === "correct" ? "text-emerald-600" : "text-rose-500"}`}>
              {colorFeedback === "correct"
                ? (isAr ? "✅ صحيح!" : "✅ Correct !")
                : (isAr ? `❌ هو اللون: ${color.ar}` : `❌ C'est : ${color.fr}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button key={opt.fr} type="button" onClick={() => handleColorAnswer(opt)}
              disabled={colorFeedback !== ""}
              className="py-4 rounded-2xl border-2 border-[#D8EFE8] bg-white text-base font-black text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <span className="w-4 h-4 rounded-full inline-block border" style={{ backgroundColor: opt.bg }} />
              {isAr ? opt.ar : opt.fr}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 5. GAME: Math Easy
  if (active?.type === "math_easy") {
    const q = MATH_QUESTIONS[mathQi];
    return (
      <div className="max-w-sm mx-auto space-y-5 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">{isAr ? active.titleAr : active.titleFr}</h2>
            <p className="text-xs text-[#4A7065]">{mathQi + 1} / {MATH_QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] px-3 py-1.5 rounded-xl text-[#243B36]">⏱ {seconds}s</span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-[#4A7065] cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-8 text-center space-y-3 shadow-sm">
          <span className="text-4xl block select-none">🧮</span>
          <p className="text-3xl font-black text-[#243B36] font-mono">
            {isAr ? q.q_ar : q.q_fr}
          </p>
          {mathFeedback && (
            <p className={`text-sm font-bold ${mathFeedback === "correct" ? "text-emerald-600" : "text-rose-500"}`}>
              {mathFeedback === "correct"
                ? (isAr ? "✅ أحسنت! إجابة صحيحة" : "✅ Bravo ! Bonne réponse")
                : (isAr ? `❌ الناتج الصحيح هو: ${q.a}` : `❌ La réponse est : ${q.a}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.opts.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleMathAnswer(opt)}
              disabled={mathFeedback !== ""}
              className="py-4 rounded-2xl border-2 border-[#D8EFE8] bg-white text-2xl font-black text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 6. GAME: Word / Object Match
  if (active?.type === "word_match") {
    const q = OBJECT_MATCH_QUESTIONS[matchQi];
    return (
      <div className="max-w-sm mx-auto space-y-5 py-4 px-4">
        <div className="bg-white rounded-2xl p-4 border border-[#D8EFE8] flex items-center justify-between shadow-2xs">
          <div>
            <h2 className="text-base font-extrabold text-[#243B36]">{isAr ? active.titleAr : active.titleFr}</h2>
            <p className="text-xs text-[#4A7065]">{matchQi + 1} / {OBJECT_MATCH_QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold bg-[#E8F6F1] px-3 py-1.5 rounded-xl text-[#243B36]">⏱ {seconds}s</span>
            <button type="button" onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-[#4A7065] cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-6 text-center space-y-3 shadow-sm">
          <span className="text-5xl block select-none">{q.icon}</span>
          <p className="text-lg font-black text-[#243B36] leading-relaxed">
            {isAr ? q.prompt_ar : q.prompt_fr}
          </p>
          {matchFeedback && (
            <p className={`text-sm font-bold ${matchFeedback === "correct" ? "text-emerald-600" : "text-rose-500"}`}>
              {matchFeedback === "correct"
                ? (isAr ? "✅ أحسنت! اختيار متطابق" : "✅ Parfait !")
                : (isAr ? `❌ الأنسب هو: ${q.a_ar}` : `❌ Le bon choix est : ${q.a_fr}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(isAr ? q.opts_ar : q.opts_fr).map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleMatchAnswer(opt)}
              disabled={matchFeedback !== ""}
              className="py-4 rounded-2xl border-2 border-[#D8EFE8] bg-white text-base font-black text-[#243B36] hover:bg-[#E8F6F1] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SCREEN 3: ALL ACTIVITIES MENU (6 GAMES)
  ══════════════════════════════════════════════ */
  return (
    <div className="max-w-md mx-auto space-y-6 py-4 px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#E8F6F1] flex items-center justify-center mx-auto">
          <Gamepad2 className="w-8 h-8 text-[#63C7B2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#243B36]">
          {isAr ? "أنشطتي" : "Mes activités"}
        </h1>
        {patientName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#63C7B2]/10 border border-[#63C7B2]/25">
            <User className="w-3.5 h-3.5 text-[#63C7B2]" />
            <span className="text-xs font-bold text-[#4A7065]">{patientName}</span>
          </div>
        )}
        <p className="text-sm text-[#4A7065]">
          {isAr ? "اختر نشاطاً لتحفيز الذاكرة وتنشيط الذهن." : "Choisissez une activité pour stimuler votre mémoire."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-[#63C7B2]" />
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => {
            const diff = DIFF_LABEL[t.difficulty] || DIFF_LABEL.easy;
            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-5 space-y-3.5 shadow-sm hover:border-[#63C7B2]/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F6F1] flex items-center justify-center text-2xl flex-shrink-0 select-none">
                    {TYPE_ICON[t.type] || "🎮"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-base font-extrabold text-[#243B36]">
                        {isAr ? t.titleAr : t.titleFr}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.color}`}>
                        {isAr ? diff.ar : diff.fr}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A7065] leading-relaxed">
                      {isAr ? t.descriptionAr : t.descriptionFr}
                    </p>
                    <p className="text-xs font-bold text-[#63C7B2] mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {t.durationMinutes} {isAr ? "دقائق" : "minutes"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startActivity(t)}
                  className="w-full py-3.5 rounded-2xl bg-[#63C7B2] text-white font-extrabold text-base flex items-center justify-center gap-2 hover:bg-[#4AAA97] active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isAr ? "ابدأ النشاط" : "Commencer"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/patient")}
        className="w-full py-3.5 rounded-2xl border-2 border-[#D8EFE8] text-[#4A7065] font-extrabold flex items-center justify-center gap-2 hover:bg-[#E8F6F1] transition-colors cursor-pointer"
      >
        <ArrowRight className="w-5 h-5" />
        <span>{isAr ? "العودة للرئيسية" : "Retour à l'accueil"}</span>
      </button>
    </div>
  );
}
