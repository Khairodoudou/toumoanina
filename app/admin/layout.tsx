"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield, LayoutDashboard, Users, FileText,
  LogOut, Menu, Heart, ChevronRight, ChevronLeft,
  UserCheck, UserCog, Activity, BookOpen, Bell,
  BarChart2, Settings, Folder, Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, isRTL } = useI18n();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-slate-300 animate-pulse">
          {isRTL ? "جارٍ التحميل..." : "Chargement..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  type NavGroup = {
    label: string;
    items: { href: string; icon: React.ElementType; label: string }[];
  };

  const navGroups: NavGroup[] = [
    {
      label: t.adminNav?.groupMain ?? "Principal",
      items: [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: t.adminNav?.dashboard ?? "Tableau de bord" },
      ],
    },
    {
      label: t.adminNav?.groupUsers ?? "Utilisateurs",
      items: [
        { href: "/admin/users",    icon: UserCog,         label: t.adminNav?.users    ?? "Comptes utilisateurs" },
        { href: "/admin/families", icon: Folder,          label: t.adminNav?.families ?? "Familles" },
        { href: "/admin/patients", icon: UserCheck,       label: t.adminNav?.patients ?? "Patients" },
      ],
    },
    {
      label: t.adminNav?.groupSupervision ?? "Supervision",
      items: [
        { href: "/admin/alerts",   icon: Bell,            label: t.adminNav?.alerts   ?? "Alertes" },
        { href: "/admin/reports",  icon: BarChart2,       label: t.adminNav?.reports  ?? "Rapports" },
        { href: "/admin/logs",     icon: FileText,        label: t.adminNav?.logs     ?? "Journaux" },
      ],
    },
    {
      label: t.adminNav?.groupPlatform ?? "Plateforme",
      items: [
        { href: "/admin/activities", icon: Activity,     label: t.adminNav?.activities ?? "Activités" },
        { href: "/admin/content",    icon: BookOpen,     label: t.adminNav?.content    ?? "Contenu" },
        { href: "/admin/settings",   icon: Settings,     label: t.adminNav?.settings   ?? "Paramètres" },
      ],
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/60">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-extrabold text-text leading-tight">ToumAnina</p>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">Admin</span>
            </div>
            <p className="text-[11px] text-text-muted font-semibold">{t.admin.subtitle}</p>
          </div>
        </Link>
      </div>

      {/* Admin User card */}
      {user && (
        <div className="mx-3 mt-4 p-3 rounded-2xl bg-slate-100 border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text truncate">{user.name}</p>
              <p className="text-[10px] text-primary font-bold">{t.sidebar.roleAdmin}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation — grouped */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/admin/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-text-muted hover:bg-bg hover:text-text"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {isActive && <ArrowIcon className="w-3.5 h-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 flex flex-col gap-2 border-t border-border/40 pt-3">
        {/* Language selector */}
        <div className="px-1">
          <LanguageSelector compact />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-red-50 hover:text-red-500 transition-all text-left w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.sidebar.logout}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Sidebar — desktop */}
      <aside className="app-sidebar hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`app-sidebar flex flex-col lg:hidden ${sidebarOpen ? "open" : ""}`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="app-main flex flex-col">
        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center justify-between px-4 py-3 bg-white border-b border-border/60 sticky top-0 z-20 nav-shadow">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-extrabold text-text">ToumAnina Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-bg text-text-muted hover:text-text transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
