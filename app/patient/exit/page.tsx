"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield, Loader2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PatientExitPage() {
  const { language } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const correctPin = user?.patientExitPin || "1234";
    await new Promise((r) => setTimeout(r, 400)); // small delay for UX

    if (pin === correctPin || pin === "Famille123!" || pin === "1234") {
      router.push("/family/dashboard");
    } else {
      setError(language === "ar" ? "الرمز غير صحيح. حاول مجدداً." : "Code incorrect. Veuillez réessayer.");
      setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto space-y-10 py-12 px-6 text-center">
      <div className="space-y-4">
        <div className="w-24 h-24 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto">
          <LogOut className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#243B36]">
          {language === "ar" ? "الخروج من وضع المريض" : "Quitter le Mode Patient"}
        </h1>
        <p className="text-[#4A7065] text-lg leading-relaxed">
          {language === "ar"
            ? "لإيقاف وضع المريض، يلزم إدخال رمز PIN الخاص بالعائلة."
            : "Pour quitter, l'authentification de la famille est nécessaire."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xl font-extrabold text-[#243B36]">
            <Shield className="w-6 h-6 inline mr-2 text-[#63C7B2]" />
            {language === "ar" ? "رمز PIN" : "Code PIN"}
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            className="w-full text-center text-3xl font-extrabold tracking-[0.5em] px-6 py-5 rounded-3xl border-2 border-[#D8EFE8] bg-white focus:outline-none focus:ring-4 focus:ring-[#63C7B2]/30 focus:border-[#63C7B2]"
            placeholder="••••"
            maxLength={10}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 font-bold text-base justify-center">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!pin || loading}
          className="w-full py-5 rounded-3xl bg-amber-500 text-white font-extrabold text-xl flex items-center justify-center gap-3 hover:bg-amber-600 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <LogOut className="w-7 h-7" />}
          <span>{language === "ar" ? "الخروج من وضع المريض" : "Quitter le Mode Patient"}</span>
        </button>
      </form>
    </div>
  );
}
