"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck, Search, Shield, MapPin, Clock,
  Smile, Activity, Phone, AlertTriangle, CheckCircle,
  RefreshCw, Loader2, Heart,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AdminPatient {
  id: string;
  name: string;
  birthDate: string;
  bloodType?: string;
  familyId: string;
  familyName: string;
  familyEmail: string;
  emergencyPhone: string;
  lastPositionLat?: number | null;
  lastPositionLng?: number | null;
  lastPositionAt?: string | null;
  isInsideSafeZone?: boolean | null;
  lastMood?: "good" | "neutral" | "difficult" | null;
  lastMoodAt?: string | null;
  activitiesCount: number;
  createdAt: string;
}

function calculateAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default function AdminPatientsPage() {
  const { t, language } = useI18n();
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/patients");
      const data = await res.json();
      setPatients(data.patients || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.familyName.toLowerCase().includes(q) ||
      p.familyEmail.toLowerCase().includes(q) ||
      (p.emergencyPhone && p.emergencyPhone.includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-primary" />
            {t.admin.patientsListTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.patientsSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchPatients();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{t.admin.refreshBtn}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-text-muted absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.patients.searchPlaceholder}
          className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 card-shadow"
        />
      </div>

      {/* Patients Table Card */}
      <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">{t.admin.noPatients}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-bg/50 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="p-4 sm:px-6">{t.admin.colPatientName}</th>
                  <th className="p-4 sm:px-6">{t.admin.colFamily}</th>
                  <th className="p-4 sm:px-6">{t.admin.colLastPosition}</th>
                  <th className="p-4 sm:px-6">{t.admin.colLastMood}</th>
                  <th className="p-4 sm:px-6">{t.admin.colActivitiesCount}</th>
                  <th className="p-4 sm:px-6">{t.patients.emergencyContact}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filtered.map((p, idx) => {
                  const age = calculateAge(p.birthDate);
                  return (
                    <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      {/* Patient Name & Age */}
                      <td className="p-4 sm:px-6 font-bold text-text">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-sm text-text truncate">{p.name}</p>
                            <p className="text-[11px] text-text-muted font-normal mt-0.5">
                              {age !== null ? `${age} ${language === "ar" ? "سنة" : "ans"}` : p.birthDate}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Family */}
                      <td className="p-4 sm:px-6">
                        <p className="font-bold text-text">{p.familyName}</p>
                        <p className="text-[10px] text-text-muted font-mono">{p.familyEmail}</p>
                      </td>

                      {/* Last Recorded Position & Timestamp */}
                      <td className="p-4 sm:px-6">
                        {p.lastPositionAt ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  p.isInsideSafeZone
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {p.isInsideSafeZone
                                  ? t.admin.insideSafeZone
                                  : t.admin.outsideSafeZone}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(p.lastPositionAt).toLocaleString(
                                language === "ar" ? "ar-DZ" : "fr-FR",
                                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-text-muted italic">
                            {t.admin.noPositionRecorded}
                          </span>
                        )}
                      </td>

                      {/* Last Mood */}
                      <td className="p-4 sm:px-6">
                        {p.lastMood ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              p.lastMood === "good"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.lastMood === "neutral"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <Smile className="w-3 h-3" />
                            {p.lastMood === "good"
                              ? t.admin.moodGood
                              : p.lastMood === "neutral"
                              ? t.admin.moodNeutral
                              : t.admin.moodDifficult}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* Cognitive Activities */}
                      <td className="p-4 sm:px-6">
                        <span className="font-extrabold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full">
                          {p.activitiesCount}
                        </span>
                      </td>

                      {/* Emergency Phone */}
                      <td className="p-4 sm:px-6 text-text-muted font-mono" dir="ltr">
                        {p.emergencyPhone}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
