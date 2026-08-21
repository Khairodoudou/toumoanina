"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Folder, Search, Users, Phone, Mail, Calendar,
  Loader2, RefreshCw, Eye, X, UserCheck, Bell, Shield,
  CheckCircle, ArrowRight, ArrowLeft,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface FamilyItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  patientsCount: number;
  createdAt: string;
}

interface FamilyDetail {
  family: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  };
  patients: Array<{
    id: string;
    name: string;
    birthDate: string;
    bloodType?: string;
    emergencyPhone: string;
    lastPositionLat?: number | null;
    lastPositionLng?: number | null;
    lastPositionAt?: string | null;
    isInsideSafeZone?: boolean | null;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    patientName: string;
    severity: string;
    isResolved: boolean;
    createdAt: string;
  }>;
}

export default function AdminFamiliesPage() {
  const { t, language, isRTL } = useI18n();
  const [families, setFamilies] = useState<FamilyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [familyDetail, setFamilyDetail] = useState<FamilyDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchFamilies = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/families");
      const data = await res.json();
      setFamilies(data.families || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handleOpenDetail = async (id: string) => {
    setSelectedFamilyId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/families/${id}`);
      const data = await res.json();
      setFamilyDetail(data);
    } catch {
      setFamilyDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = families.filter((f) => {
    const q = search.toLowerCase().trim();
    return (
      f.name.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.phone && f.phone.includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <Folder className="w-8 h-8 text-primary" />
            {t.admin.familiesListTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.familiesSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchFamilies();
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

      {/* Families Table */}
      <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">{t.admin.noFamilies}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-bg/50 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="p-4 sm:px-6">{t.admin.colFamilyName}</th>
                  <th className="p-4 sm:px-6">{t.admin.colEmail}</th>
                  <th className="p-4 sm:px-6">{t.admin.colPhone}</th>
                  <th className="p-4 sm:px-6">{t.admin.colPatientsCount}</th>
                  <th className="p-4 sm:px-6">{t.admin.colStatus}</th>
                  <th className="p-4 sm:px-6">{t.admin.colCreatedAt}</th>
                  <th className="p-4 sm:px-6 text-right rtl:text-left">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filtered.map((f, idx) => (
                  <tr key={`${f.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-text">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{f.name}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 text-text-muted font-mono">{f.email}</td>
                    <td className="p-4 sm:px-6 text-text-muted font-mono" dir="ltr">
                      {f.phone || "—"}
                    </td>
                    <td className="p-4 sm:px-6">
                      <span className="font-extrabold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full">
                        {f.patientsCount}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {t.admin.statusActive}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-text-muted font-mono">
                      {new Date(f.createdAt).toLocaleDateString(
                        language === "ar" ? "ar-DZ" : "fr-FR"
                      )}
                    </td>
                    <td className="p-4 sm:px-6 text-right rtl:text-left">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(f.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>{t.admin.btnViewDetails}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Family Detail Modal */}
      {selectedFamilyId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 border border-border shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-lg">
                  {familyDetail?.family.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-text">{familyDetail?.family.name}</h3>
                  <p className="text-xs text-text-muted">{familyDetail?.family.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFamilyId(null);
                  setFamilyDetail(null);
                }}
                className="p-2 rounded-xl text-text-muted hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : familyDetail ? (
              <div className="space-y-6">
                {/* Info Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-text-muted font-bold">{t.admin.colPhone}</p>
                    <p className="font-mono text-text font-bold mt-0.5" dir="ltr">
                      {familyDetail.family.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted font-bold">{t.admin.colCreatedAt}</p>
                    <p className="font-mono text-text font-bold mt-0.5">
                      {new Date(familyDetail.family.createdAt).toLocaleDateString(
                        language === "ar" ? "ar-DZ" : "fr-FR"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted font-bold">{t.admin.colPatientsCount}</p>
                    <p className="font-extrabold text-primary mt-0.5">
                      {familyDetail.patients.length}
                    </p>
                  </div>
                </div>

                {/* Associated Patients */}
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-text flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    {t.admin.familyDetailPatients} ({familyDetail.patients.length})
                  </h4>
                  {familyDetail.patients.length === 0 ? (
                    <p className="text-xs text-text-muted">{t.admin.noPatients}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {familyDetail.patients.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl bg-white border border-border/70 space-y-2 card-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-extrabold text-xs text-text">{p.name}</p>
                            {p.bloodType && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                                {p.bloodType}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted">
                            {t.admin.colBirthDate}: {p.birthDate}
                          </p>
                          {p.lastPositionAt ? (
                            <div className="text-[10px] text-text-muted bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <p className="font-bold text-text">{t.admin.colLastPosition}</p>
                              <p className="font-mono mt-0.5">
                                {p.lastPositionLat?.toFixed(4)}, {p.lastPositionLng?.toFixed(4)}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">
                                {t.admin.colLastPositionAt}:{" "}
                                {new Date(p.lastPositionAt).toLocaleString(
                                  language === "ar" ? "ar-DZ" : "fr-FR"
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-text-muted italic">
                              {t.admin.noPositionRecorded}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Alerts */}
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-text flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    {t.admin.familyDetailAlerts} ({familyDetail.alerts.length})
                  </h4>
                  {familyDetail.alerts.length === 0 ? (
                    <p className="text-xs text-text-muted">{t.admin.noAlerts}</p>
                  ) : (
                    <ul className="divide-y divide-border/40 bg-slate-50 rounded-2xl p-2 border border-slate-100 text-xs">
                      {familyDetail.alerts.map((alt) => (
                        <li key={alt.id} className="py-2.5 px-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-text truncate">{alt.title}</p>
                            <p className="text-[10px] text-text-muted">
                              {alt.patientName} •{" "}
                              {new Date(alt.createdAt).toLocaleDateString(
                                language === "ar" ? "ar-DZ" : "fr-FR"
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              alt.isResolved
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {alt.isResolved ? t.admin.alertResolved : t.admin.alertUnresolved}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 text-center py-6">Erreur de chargement</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFamilyId(null);
                  setFamilyDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text font-bold text-xs transition-colors"
              >
                {language === "ar" ? "إغلاق" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
