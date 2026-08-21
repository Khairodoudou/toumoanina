"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, ChevronDown, Zap, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
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

export default function PatientModePage() {
  const { language } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [activating, setActivating] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      const list: Patient[] = data.patients || [];
      setPatients(list);
      if (list.length > 0) {
        setSelectedId(user?.activePatientId || list[0].id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const selectedPatient = patients.find((p) => p.id === selectedId) || patients[0];

  const handleActivate = async () => {
    if (!selectedId) return;
    setActivating(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("toumoanina_active_patient_id", selectedId);
      }

      await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePatientId: selectedId }),
      });
      // Audit log
      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedId, latitude: 36.7538, longitude: 3.0588, accuracy: 0, isInsideSafeZone: true, distanceFromHomeMeters: 0, source: "patient_device" }),
      }).catch(() => {});
      router.push("/patient");
    } catch { /* ignore */ }
    finally { setActivating(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 py-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-3xl bg-gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
          <UserCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-text">
          {language === "ar" ? "وضع المريض" : "Mode Patient"}
        </h1>
        <p className="text-text-muted text-sm max-w-sm mx-auto">
          {language === "ar"
            ? "سيتم تغيير الشاشة إلى واجهة بسيطة مخصصة للقريب."
            : "L'interface passera en mode simplifié adapté au proche."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : patients.length === 0 ? (
        <div className="text-center bg-white rounded-3xl p-8 border border-border/60 card-shadow">
          <p className="text-text-muted font-bold">
            {language === "ar" ? "لا يوجد قريب مسجّل بعد." : "Aucun proche enregistré."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-border/60 card-shadow space-y-6">
          {/* Step 1: Select patient */}
          <div className="space-y-3">
            <p className="font-extrabold text-text text-sm">
              <span className="inline-flex w-6 h-6 rounded-full bg-primary text-white text-xs items-center justify-center mr-2">1</span>
              {language === "ar" ? "اختر القريب" : "Sélectionnez le proche"}
            </p>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 rounded-2xl border border-border bg-bg text-text font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{calcAge(p.birthDate) ? ` (${calcAge(p.birthDate)} ${language === "ar" ? "سنة" : "ans"})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Step 2: Confirm */}
          <div className="space-y-3">
            <p className="font-extrabold text-text text-sm">
              <span className="inline-flex w-6 h-6 rounded-full bg-primary text-white text-xs items-center justify-center mr-2">2</span>
              {language === "ar" ? "تأكيد التفعيل" : "Confirmation"}
            </p>
            {selectedPatient && (
              <div className="bg-bg rounded-2xl p-4 flex items-center gap-4 border border-border/60">
                <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-xl flex-shrink-0 overflow-hidden">
                  {selectedPatient.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedPatient.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-text">{selectedPatient.name}</p>
                  <p className="text-xs text-text-muted">
                    {language === "ar"
                      ? "سيتم تفعيل وضع المريض لهذا القريب."
                      : "Le Mode Patient sera activé pour ce proche."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Activate Button */}
          <button
            type="button"
            onClick={handleActivate}
            disabled={activating || !selectedId}
            className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {activating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            <span>{language === "ar" ? "تفعيل وضع المريض" : "Activer le Mode Patient"}</span>
          </button>

          <p className="text-xs text-text-muted text-center">
            {language === "ar"
              ? "لإيقاف وضع المريض، يلزم إدخال رمز PIN الخاص بالعائلة."
              : "Pour quitter le Mode Patient, le code PIN de la famille est requis."}
          </p>
        </div>
      )}
    </div>
  );
}
