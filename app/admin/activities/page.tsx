"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, Plus, Search, Edit2, Trash2, CheckCircle,
  XCircle, Clock, Loader2, RefreshCw, X, AlertCircle,
  Brain, HelpCircle, Eye,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ActivityTemplate {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: "memory_pairs" | "photo_memory" | "daily_puzzle";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminActivitiesPage() {
  const { t, language } = useI18n();
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    titleFr: "",
    titleAr: "",
    descriptionFr: "",
    descriptionAr: "",
    type: "memory_pairs" as ActivityTemplate["type"],
    difficulty: "easy" as ActivityTemplate["difficulty"],
    durationMinutes: 10,
    isActive: true,
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormData({
      titleFr: "",
      titleAr: "",
      descriptionFr: "",
      descriptionAr: "",
      type: "memory_pairs",
      difficulty: "easy",
      durationMinutes: 10,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (tpl: ActivityTemplate) => {
    setEditingTemplate(tpl);
    setFormData({
      titleFr: tpl.titleFr,
      titleAr: tpl.titleAr,
      descriptionFr: tpl.descriptionFr,
      descriptionAr: tpl.descriptionAr,
      type: tpl.type,
      difficulty: tpl.difficulty,
      durationMinutes: tpl.durationMinutes,
      isActive: tpl.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTemplate) {
        // PUT /api/admin/activity-templates/[id]
        const res = await fetch(`/api/admin/activity-templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
      } else {
        // POST /api/admin/activity-templates
        const res = await fetch("/api/admin/activity-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
      }

      setMessage({
        type: "success",
        text: language === "ar" ? "تم الحفظ بنجاح" : "Enregistré avec succès",
      });
      setModalOpen(false);
      await fetchTemplates();
    } catch {
      setMessage({
        type: "error",
        text: language === "ar" ? "حدث خطأ أثناء الحفظ" : "Erreur lors de l'enregistrement",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg =
      language === "ar"
        ? "هل أنت متأكد من حذف هذا النموذج؟"
        : "Êtes-vous sûr de vouloir supprimer ce modèle ?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/activity-templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessage({
        type: "success",
        text: language === "ar" ? "تم الحذف بنجاح" : "Modèle supprimé",
      });
      await fetchTemplates();
    } catch {
      setMessage({
        type: "error",
        text: language === "ar" ? "فشل الحذف" : "Échec de la suppression",
      });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleActive = async (tpl: ActivityTemplate) => {
    try {
      await fetch(`/api/admin/activity-templates/${tpl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tpl.isActive }),
      });
      await fetchTemplates();
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            {t.admin.activitiesListTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.activitiesSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchTemplates();
            }}
            className="p-2.5 rounded-xl bg-white border border-border text-text-muted hover:text-text hover:border-primary/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-extrabold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin.btnAddActivity}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-fadeIn ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Activities Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-border/50 card-shadow">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-text-muted">{t.admin.noActivities}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 card-shadow ${
                tpl.isActive ? "border-border/60" : "border-slate-200 bg-slate-50/60 opacity-80"
              }`}
            >
              <div className="space-y-3">
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      tpl.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : tpl.difficulty === "medium"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {tpl.difficulty === "easy"
                      ? t.admin.difficultyEasy
                      : tpl.difficulty === "medium"
                      ? t.admin.difficultyMedium
                      : t.admin.difficultyHard}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(tpl)}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 transition-all ${
                      tpl.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tpl.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        {t.admin.statusActive}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        {language === "ar" ? "معطل" : "Inactif"}
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="font-extrabold text-base text-text">
                    {language === "ar" ? tpl.titleAr : tpl.titleFr}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {language === "ar" ? tpl.titleFr : tpl.titleAr}
                  </p>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {language === "ar" ? tpl.descriptionAr : tpl.descriptionFr}
                  </p>
                </div>
              </div>

              {/* Footer info & Actions */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-text-muted font-bold">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{tpl.durationMinutes} min</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tpl)}
                    className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    title={t.admin.btnEditActivity}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t.admin.btnDeleteActivity}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Activity Template */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 border border-border shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-text">
                {editingTemplate ? t.admin.modalEditActivity : t.admin.modalAddActivity}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldTitleFr} *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleFr}
                    onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="Ex: Jeu de mémoire des paires"
                  />
                </div>
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldTitleAr} *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none text-right"
                    placeholder="مثال: لعبة أزواج الذاكرة"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldDescFr}</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionFr}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldDescAr}</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldType}</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ActivityTemplate["type"] })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="memory_pairs">{t.admin.activityTypeMemoryPairs}</option>
                    <option value="photo_memory">{t.admin.activityTypePhotoMemory}</option>
                    <option value="daily_puzzle">{t.admin.activityTypePuzzle}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldDifficulty}</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as ActivityTemplate["difficulty"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="easy">{t.admin.difficultyEasy}</option>
                    <option value="medium">{t.admin.difficultyMedium}</option>
                    <option value="hard">{t.admin.difficultyHard}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldDuration}</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) || 10 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-text cursor-pointer">
                  {t.admin.fieldIsActive}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text font-bold transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Annuler"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t.admin.btnSave}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
