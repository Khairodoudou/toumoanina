"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Shield, User, Mail, Phone, Calendar,
  Loader2, Check, RefreshCw, Trash2, Eye, X, AlertCircle,
  Lock, CheckCircle, XCircle, Power,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "family" | "admin";
  patientsCount: number;
  createdAt: string;
  isActive: boolean;
  status: "active" | "disabled";
}

export default function AdminUsersPage() {
  const { t, language } = useI18n();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.email.toLowerCase() === "admin@gmail.com" || user.id === "usr_admin_demo") {
      setMessage({ type: "error", text: t.admin.cannotEditAdmin });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    const newActiveState = !user.isActive;
    setUpdatingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isActive: newActiveState }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Erreur" });
      } else {
        setMessage({
          type: "success",
          text: newActiveState
            ? (language === "ar" ? "تم تفعيل الحساب بنجاح" : "Compte activé avec succès")
            : (language === "ar" ? "تم تعطيل الحساب" : "Compte désactivé"),
        });
        await fetchUsers();
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.email.toLowerCase() === "admin@gmail.com" || user.id === "usr_admin_demo") {
      setMessage({ type: "error", text: t.admin.cannotEditAdmin });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    const confirmMsg =
      language === "ar"
        ? `هل أنت متأكد من حذف الحساب "${user.name}"؟`
        : `Êtes-vous sûr de vouloir supprimer le compte "${user.name}" ?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Erreur" });
      } else {
        setMessage({
          type: "success",
          text: language === "ar" ? "تم حذف الحساب بنجاح" : "Compte supprimé avec succès",
        });
        await fetchUsers();
      }
    } catch {
      setMessage({ type: "error", text: "Erreur" });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            {t.admin.usersListTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{t.admin.usersSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-sm font-semibold text-text-muted hover:text-text hover:border-primary/40 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{t.admin.refreshBtn}</span>
        </button>
      </div>

      {/* Notification toast */}
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

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-border/50 card-shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">{t.admin.noUsers}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-bg/50 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                  <th className="p-4 sm:px-6">{t.admin.colFamilyName}</th>
                  <th className="p-4 sm:px-6">{t.admin.colEmail}</th>
                  <th className="p-4 sm:px-6">{t.admin.colRole}</th>
                  <th className="p-4 sm:px-6">{t.admin.colStatus}</th>
                  <th className="p-4 sm:px-6 text-right rtl:text-left">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {filtered.map((u, idx) => {
                  const isPrimaryAdmin =
                    u.email.toLowerCase() === "admin@gmail.com" || u.id === "usr_admin_demo";
                  const isActive = u.isActive !== false;

                  return (
                    <tr
                      key={`${u.id}-${idx}`}
                      className={`transition-colors ${
                        isActive ? "hover:bg-slate-50/70" : "bg-slate-50/50 opacity-75"
                      }`}
                    >
                      {/* Name + Phone */}
                      <td className="p-4 sm:px-6 font-bold text-text">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                              u.role === "admin"
                                ? "bg-slate-900 text-primary shadow-sm"
                                : "bg-gradient-brand text-white"
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-extrabold text-text">{u.name}</p>
                              {isPrimaryAdmin && (
                                <span title="Admin Unique" className="text-amber-500">
                                  <Lock className="w-3 h-3 inline" />
                                </span>
                              )}
                            </div>
                            {u.phone && (
                              <p className="text-[10px] text-text-muted font-mono" dir="ltr">
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 sm:px-6 text-text-muted font-mono">{u.email}</td>

                      {/* Role */}
                      <td className="p-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            u.role === "admin"
                              ? "bg-slate-900 text-white"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <Shield className="w-3 h-3 text-primary" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {u.role === "admin" ? t.admin.roleAdmin : t.admin.roleFamily}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              {t.admin.statusActive}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              {t.admin.statusDisabled}
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:px-6 text-right rtl:text-left">
                        <div className="inline-flex items-center gap-2">
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-text font-bold text-xs transition-colors"
                            title={t.admin.btnViewDetails}
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>{t.admin.btnViewDetails}</span>
                          </button>

                          {/* Activate / Deactivate Toggle Button */}
                          {!isPrimaryAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={updatingId === u.id}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                                isActive
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              }`}
                              title={isActive ? t.admin.btnDeactivate : t.admin.btnActivate}
                            >
                              {updatingId === u.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Power className="w-3 h-3" />
                              )}
                              <span>{isActive ? t.admin.btnDeactivate : t.admin.btnActivate}</span>
                            </button>
                          )}

                          {/* Delete user */}
                          {!isPrimaryAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              disabled={updatingId === u.id}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                              title={language === "ar" ? "حذف الحساب" : "Supprimer le compte"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal (العين) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-border shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-extrabold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-text">{selectedUser.name}</h3>
                  <p className="text-xs text-text-muted">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-text-muted hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="text-text-muted font-bold">{t.admin.colRole}</p>
                <p className="font-extrabold text-text mt-0.5">
                  {selectedUser.role === "admin" ? t.admin.roleAdmin : t.admin.roleFamily}
                </p>
              </div>
              <div>
                <p className="text-text-muted font-bold">{t.admin.colStatus}</p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
                    selectedUser.isActive !== false
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedUser.isActive !== false ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      {t.admin.statusActive}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      {t.admin.statusDisabled}
                    </>
                  )}
                </span>
              </div>
              <div>
                <p className="text-text-muted font-bold">{t.admin.colPatientsCount}</p>
                <p className="font-extrabold text-primary mt-0.5">{selectedUser.patientsCount}</p>
              </div>
              <div>
                <p className="text-text-muted font-bold">{t.admin.colPhone}</p>
                <p className="font-mono text-text font-bold mt-0.5" dir="ltr">
                  {selectedUser.phone || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted font-bold">{t.admin.colCreatedAt}</p>
                <p className="font-mono text-text font-bold mt-0.5">
                  {new Date(selectedUser.createdAt).toLocaleDateString(
                    language === "ar" ? "ar-DZ" : "fr-FR",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
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
