"use client";

import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface PatientProfile {
  name: string;
  birthDate: string;
  bloodType?: string;
  dailyHabits?: string;
  dietPreferences?: string;
  photoUrl?: string;
}

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function PatientProfilePage() {
  const { language } = useI18n();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localActiveId = typeof window !== "undefined" ? localStorage.getItem("toumoanina_active_patient_id") : null;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (d) => {
        const activeId = localActiveId || d.user?.activePatientId;
        if (activeId) {
          const pr = await fetch(`/api/patients/${activeId}`, { cache: "no-store" });
          if (pr.ok) {
            const pd = await pr.json();
            setPatient(pd.patient);
            return;
          }
        }
        // Fallback to first patient
        const prList = await fetch("/api/patients", { cache: "no-store" });
        if (prList.ok) {
          const pList = await prList.json();
          if (pList.patients?.[0]) setPatient(pList.patients[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 animate-spin text-[#63C7B2]" /></div>;
  }

  const age = patient ? calcAge(patient.birthDate) : null;

  return (
    <div className="max-w-sm mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-3">
        <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-[#63C7B2] flex items-center justify-center shadow-lg">
          {patient?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={patient.photoUrl} alt="profil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-white" />
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-[#243B36]">{patient?.name || "—"}</h1>
        {age !== null && (
          <p className="text-xl text-[#4A7065] font-bold">
            {age} {language === "ar" ? "سنة" : "ans"}
          </p>
        )}
      </div>

      {patient && (
        <div className="space-y-4">
          {patient.birthDate && (
            <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-5">
              <p className="text-sm font-bold text-[#4A7065] mb-1">
                {language === "ar" ? "تاريخ الميلاد" : "Date de naissance"}
              </p>
              <p className="text-xl font-extrabold text-[#243B36]">
                {new Date(patient.birthDate).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          )}

          {patient.dailyHabits && (
            <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-5">
              <p className="text-sm font-bold text-[#4A7065] mb-2">
                {language === "ar" ? "عاداتي اليومية" : "Mes habitudes"}
              </p>
              <p className="text-lg text-[#243B36] leading-relaxed">{patient.dailyHabits}</p>
            </div>
          )}

          {patient.dietPreferences && (
            <div className="bg-white rounded-3xl border-2 border-[#D8EFE8] p-5">
              <p className="text-sm font-bold text-[#4A7065] mb-2">
                {language === "ar" ? "تفضيلاتي الغذائية" : "Mes préférences alimentaires"}
              </p>
              <p className="text-lg text-[#243B36] leading-relaxed">{patient.dietPreferences}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
