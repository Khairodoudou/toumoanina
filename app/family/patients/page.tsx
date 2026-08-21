"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, MapPin, Phone, Calendar,
  Droplets, X, Save, Loader2, Users,
  AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import PatientPhotoUploader from "@/components/patients/PatientPhotoUploader";
import HomeLocationPicker from "@/components/patients/HomeLocationPicker";

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  bloodType?: string;
  emergencyPhone: string;
  photoUrl?: string;
  dailyHabits?: string;
  dietPreferences?: string;
  medicalNotes?: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
  createdAt: string;
}

const emptyForm = {
  name: "", birthDate: "", bloodType: "", emergencyPhone: "",
  photoUrl: "", dailyHabits: "", dietPreferences: "",
  medicalNotes: "", safeLatitude: "36.7538", safeLongitude: "3.0588",
  safeRadiusMeters: "600",
};

function calcAge(birthDate: string) {
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PatientsPage() {
  const { t, language } = useI18n();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | "add" | Patient>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    const data = await res.json();
    setPatients(data.patients || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setForm(emptyForm); setError(null); setModal("add"); };
  const openEdit = (p: Patient) => {
    setForm({
      name: p.name, birthDate: p.birthDate, bloodType: p.bloodType || "",
      emergencyPhone: p.emergencyPhone, photoUrl: p.photoUrl || "",
      dailyHabits: p.dailyHabits || "", dietPreferences: p.dietPreferences || "",
      medicalNotes: p.medicalNotes || "",
      safeLatitude: String(p.safeLatitude), safeLongitude: String(p.safeLongitude),
      safeRadiusMeters: String(p.safeRadiusMeters),
    });
    setError(null);
    setModal(p);
  };
  const closeModal = () => { setModal(null); setError(null); };

  const handleSave = async () => {
    if (!form.name || !form.emergencyPhone) {
      setError(t.patients.fieldName + " / " + t.patients.fieldPhone + " requis.");
      return;
    }
    setSaving(true);
    setError(null);

    const isEdit = modal && modal !== "add";
    const url = isEdit ? `/api/patients/${(modal as Patient).id}` : "/api/patients";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        safeLatitude: Number(form.safeLatitude),
        safeLongitude: Number(form.safeLongitude),
        safeRadiusMeters: Number(form.safeRadiusMeters),
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'enregistrement.");
      return;
    }
    await fetchPatients();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    await fetchPatients();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text">{t.patients.title}</h1>
          <p className="text-sm text-text-muted mt-1">{t.patients.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t.patients.btnAdd}
        </button>
      </div>

      {/* Patient list */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-border/50 card-shadow text-center">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-bold text-text mb-2">{t.patients.emptyStateTitle}</h2>
          <p className="text-sm text-text-muted mb-6">{t.patients.emptyStateDesc}</p>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {t.patients.btnAdd}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {patients.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-border/50 card-shadow flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-bg">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xl">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-text text-lg leading-tight">{p.name}</h3>
                  <p className="text-sm text-text-muted">{calcAge(p.birthDate)} {t.patients.ageYears}</p>
                  {p.bloodType && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mt-1">
                      <Droplets className="w-2.5 h-2.5" />
                      {p.bloodType}
                    </span>
                  )}
                </div>
              </div>

              {/* Info rows */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span dir="ltr" className="font-mono">{p.emergencyPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{t.patients.bornOn} {new Date(p.birthDate).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{t.patients.safetyRadius} {p.safeRadiusMeters}{t.patients.meters}</span>
                </div>
              </div>

              {/* Notes preview */}
              {p.dailyHabits && (
                <p className="text-xs text-text-muted bg-bg rounded-xl px-3 py-2 border border-border/40 line-clamp-2">
                  {p.dailyHabits}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t.patients.editProfile}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(p.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.patients.deleteProfile}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-text">
                {modal === "add" ? t.patients.modalAddTitle : t.patients.modalEditTitle}
              </h2>
              <button type="button" onClick={closeModal} className="p-2 rounded-xl hover:bg-bg text-text-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Photo Uploader Component */}
              <div className="sm:col-span-2">
                <PatientPhotoUploader
                  value={form.photoUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
                  patientName={form.name}
                />
              </div>

              {[
                { key: "name", label: t.patients.fieldName, type: "text", required: true },
                { key: "birthDate", label: t.patients.fieldBirthdate, type: "date" },
                { key: "emergencyPhone", label: t.patients.fieldPhone, type: "tel", required: true },
                { key: "bloodType", label: t.patients.fieldBlood, type: "text" },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-text mb-1.5 block">
                    {label}{required && <span className="text-primary ml-1">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              ))}

              {/* Smart Home Location & Geofence Picker */}
              <div className="sm:col-span-2">
                <HomeLocationPicker
                  latitude={form.safeLatitude}
                  longitude={form.safeLongitude}
                  radius={form.safeRadiusMeters}
                  onLocationChange={(lat, lng) =>
                    setForm((prev) => ({
                      ...prev,
                      safeLatitude: String(lat),
                      safeLongitude: String(lng),
                    }))
                  }
                  onRadiusChange={(r) =>
                    setForm((prev) => ({
                      ...prev,
                      safeRadiusMeters: String(r),
                    }))
                  }
                />
              </div>

              {[
                { key: "dailyHabits", label: t.patients.fieldHabits },
                { key: "dietPreferences", label: t.patients.fieldDiet },
                { key: "medicalNotes", label: t.patients.fieldNotes },
              ].map(({ key, label }) => (
                <div key={key} className="sm:col-span-2">
                  <label className="text-xs font-bold text-text mb-1.5 block">{label}</label>
                  <textarea
                    rows={2}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/40">
              <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-muted hover:bg-bg transition-colors">
                {t.patients.btnCancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-brand text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.patients.btnSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm card-shadow text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">{t.patients.confirmDeleteTitle}</h3>
            <p className="text-sm text-text-muted mb-6">{t.patients.confirmDeleteDesc}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-bg transition-colors">
                {t.patients.btnCancel}
              </button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                {t.patients.deleteProfile}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
