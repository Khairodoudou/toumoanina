"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, RotateCcw, Trophy,
  Clock, Target, Sparkles, CheckCircle2, Home,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = ["🌸", "🍎", "🐱", "☀️", "🏠", "🌿"];

export default function MemoryGamePage() {
  const { t, isRTL, language } = useI18n();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  // Initialize new game
  const startNewGame = useCallback(() => {
    const deck: Card[] = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
    setFlippedCards([]);
    setTurns(0);
    setMatchedCount(0);
    setSeconds(0);
    setIsCompleted(false);
    setIsGameActive(true);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGameActive && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, isCompleted]);

  // Handle card click
  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setTurns((prev) => prev + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find((c) => c.id === firstId);
      const secondCard = newCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedCards([]);
          setMatchedCount((prev) => {
            const next = prev + 1;
            if (next === ICONS.length) {
              handleGameComplete(turns + 1, seconds);
            }
            return next;
          });
        }, 500);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleGameComplete = async (finalTurns: number, finalSeconds: number) => {
    setIsCompleted(true);
    setIsGameActive(false);
    setSavingResult(true);

    try {
      // Calculate score out of 100
      const score = Math.max(10, Math.round(100 - (finalTurns - ICONS.length) * 5));

      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "memory-cards",
          turns: finalTurns,
          durationSeconds: finalSeconds,
          score,
          difficulty: "easy",
        }),
      });
    } catch {
      // ignore
    } finally {
      setSavingResult(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-3xl mx-auto space-y-6 my-auto">
      {/* Header with return button & title */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/patient"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#D8EFE8] text-[#243B36] font-bold text-xs sm:text-sm shadow-xs hover:bg-slate-50 transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.memoryGame.btnBackToPatient}</span>
        </Link>

        <button
          type="button"
          onClick={startNewGame}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#E8F6F1] text-[#2A6559] font-bold text-xs sm:text-sm hover:bg-[#D6EFE7] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.memoryGame.btnPlayAgain}</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 border border-[#D8EFE8] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#527970] text-xs font-bold mb-0.5">
            <Target className="w-3.5 h-3.5 text-[#63C7B2]" />
            <span>{t.memoryGame.turns}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#243B36] font-mono">{turns}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-[#D8EFE8] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#527970] text-xs font-bold mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.memoryGame.pairs}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#243B36] font-mono">
            {matchedCount} / {ICONS.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 border border-[#D8EFE8] text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#527970] text-xs font-bold mb-0.5">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <span>{t.memoryGame.time}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#243B36] font-mono">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-3xl border border-[#D8EFE8] shadow-sm">
        {cards.map((card) => {
          const isOpen = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              disabled={isOpen || flippedCards.length === 2}
              className={`aspect-square rounded-2xl sm:rounded-3xl text-4xl sm:text-5xl flex items-center justify-center transition-all duration-300 font-sans shadow-xs ${
                isOpen
                  ? card.isMatched
                    ? "bg-emerald-50 border-2 border-emerald-300 scale-95"
                    : "bg-[#E8F6F1] border-2 border-[#63C7B2] scale-100"
                  : "bg-slate-50 border-2 border-slate-200 hover:border-[#63C7B2] hover:bg-[#F6FBF9] active:scale-95"
              }`}
            >
              {isOpen ? card.emoji : "❓"}
            </button>
          );
        })}
      </div>

      {/* Congrats Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl border border-[#D8EFE8] animate-fade-in space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-[#243B36]">
              {t.memoryGame.congratsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#527970] leading-relaxed">
              {t.memoryGame.congratsDesc}
            </p>

            <div className="p-4 rounded-2xl bg-[#F6FBF9] border border-[#D8EFE8] flex items-center justify-around font-mono">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#527970]">{t.memoryGame.turns}</p>
                <p className="text-xl font-extrabold text-[#243B36]">{turns}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#527970]">{t.memoryGame.time}</p>
                <p className="text-xl font-extrabold text-[#243B36]">
                  {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/patient"
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>{t.memoryGame.btnBackToPatient}</span>
              </Link>
              <button
                type="button"
                onClick={startNewGame}
                className="flex-1 py-3.5 rounded-2xl bg-[#63C7B2] hover:bg-[#4AAA97] text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.memoryGame.btnPlayAgain}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
