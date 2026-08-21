"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Search, Edit2, Trash2, CheckCircle,
  XCircle, Loader2, RefreshCw, X, AlertCircle, FileText,
  Eye, Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ContentItem {
  id: string;
  titleFr: string;
  titleAr: string;
  contentFr: string;
  contentAr: string;
  category: "advice" | "exercise" | "nutrition" | "news";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContentPage() {
  const { t, language } = useI18n();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titleFr: "",
    titleAr: "",
    contentFr: "",
    contentAr: "",
    category: "advice" as ContentItem["category"],
    isPublished: true,
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      titleFr: "",
      titleAr: "",
      contentFr: "",
      contentAr: "",
      category: "advice",
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      titleFr: item.titleFr,
      titleAr: item.titleAr,
      contentFr: item.contentFr,
      contentAr: item.contentAr,
      category: item.category,
      isPublished: item.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/content/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
      }

      setMessage({
        type: "success",
        text: language === "ar" ? "تم الحفظ بنجاح" : "Article enregistré avec succès",
      });
      setModalOpen(false);
      await fetchItems();
    } catch {
      setMessage({
        type: "error",
        text: language === "ar" ? "فشل الحفظ" : "Erreur lors de l'enregistrement",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg =
      language === "ar"
        ? "هل أنت متأكد من حذف هذا المقال؟"
        : "Êtes-vous sûr de vouloir supprimer cet article ?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessage({
        type: "success",
        text: language === "ar" ? "تم حذف المقال" : "Article supprimé",
      });
      await fetchItems();
    } catch {
      setMessage({
        type: "error",
        text: language === "ar" ? "فشل الحذف" : "Échec de la suppression",
      });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      await fetch(`/api/admin/content/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      await fetchItems();
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
            <BookOpen className="w-8 h-8 text-primary" />
            {t.admin.contentListTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.contentSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchItems();
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
            <span>{t.admin.btnAddContent}</span>
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

      {/* Content List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-border/50 card-shadow">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-text-muted">{t.admin.noContent}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-border/60 p-5 sm:p-6 card-shadow space-y-4 hover:border-primary/40 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        item.category === "advice"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : item.category === "exercise"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : item.category === "nutrition"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.category === "advice"
                        ? t.admin.catAdvice
                        : item.category === "exercise"
                        ? t.admin.catExercise
                        : item.category === "nutrition"
                        ? t.admin.catNutrition
                        : t.admin.catNews}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition-all ${
                        item.isPublished
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.isPublished ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {t.admin.published}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          {t.admin.draft}
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-text mt-1">
                    {language === "ar" ? item.titleAr : item.titleFr}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === "ar" ? item.titleFr : item.titleAr}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    title={t.admin.btnEditContent}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t.admin.btnDeleteContent}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dual preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Français
                  </p>
                  <p className="text-text leading-relaxed">{item.contentFr}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 text-right" dir="rtl">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    العربية
                  </p>
                  <p className="text-text leading-relaxed">{item.contentAr}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-border/30 font-mono">
                <span>
                  {t.admin.colUpdatedAt}:{" "}
                  {new Date(item.updatedAt).toLocaleDateString(language === "ar" ? "ar-DZ" : "fr-FR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Content */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-border shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-text">
                {editingItem ? t.admin.modalEditContent : t.admin.modalAddContent}
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
                    placeholder="Titre en français..."
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
                    placeholder="العنوان بالعربية..."
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldContentFr} *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.contentFr}
                    onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                    placeholder="Contenu de l'article en français..."
                  />
                </div>
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.fieldContentAr} *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.contentAr}
                    onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none text-right"
                    placeholder="محتوى المقال بالعربية..."
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-text mb-1 block">{t.admin.colCategory}</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ContentItem["category"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="advice">{t.admin.catAdvice}</option>
                    <option value="exercise">{t.admin.catExercise}</option>
                    <option value="nutrition">{t.admin.catNutrition}</option>
                    <option value="news">{t.admin.catNews}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPublishedToggle"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isPublishedToggle" className="font-bold text-text cursor-pointer">
                    {t.admin.published} ({t.admin.btnPublish})
                  </label>
                </div>
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
