"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, MapPin, Smile,
  Gamepad2, Bell, Settings, LogOut,
  Heart, Shield, Menu, X, ChevronRight, ChevronLeft,
  Zap, UserCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/lib/auth/AuthContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const { t, isRTL } = useI18n();
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => {
        const active = (d.alerts || []).filter((a: { isResolved: boolean }) => !a.isResolved).length;
        setAlertCount(active);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const nav = [
    { href: "/family/dashboard", icon: LayoutDashboard, label: t.sidebar.dashboard },
    { href: "/family/patients",  icon: Users,           label: t.sidebar.patients },
    { href: "/family/tracking",  icon: MapPin,          label: t.sidebar.tracking },
    { href: "/family/moods",     icon: Smile,           label: t.sidebar.moods },
    { href: "/family/activities",icon: Gamepad2,        label: t.sidebar.activities },
    {
      href: "/family/alerts",
      icon: Bell,
      label: t.sidebar.alerts,
      badge: alertCount,
    },
    { href: "/family/settings",  icon: Settings,        label: t.sidebar.settings },
  ];

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/60">
        <Link href="/family/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-text leading-tight">ToumAnina</p>
            <p className="text-[11px] text-primary font-semibold">طُمَأْنِينَة</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      {user && (
        <div className="mx-3 mt-4 p-3 rounded-2xl bg-primary/8 border border-primary/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text truncate">{user.name}</p>
              <p className="text-[10px] text-primary font-semibold">{t.sidebar.roleFamily}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== "/family/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:bg-bg hover:text-text"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-red-500 text-white"}`}>
                  {badge}
                </span>
              )}
              {isActive && <ArrowIcon className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 flex flex-col gap-2 border-t border-border/40 pt-3">
        {/* Activate Patient Mode */}
        <Link
          href="/patient"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
        >
          <UserCheck className="w-4 h-4" />
          <span className="flex-1">{t.sidebar.patientMode}</span>
          <Zap className="w-3.5 h-3.5 opacity-75" />
        </Link>

        {/* Language selector */}
        <div className="px-1">
          <LanguageSelector compact />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-text-muted hover:bg-red-50 hover:text-red-500 transition-all text-left w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.sidebar.logout}</span>
        </button>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-text-muted animate-pulse">
          {isRTL ? "جارٍ التحميل..." : "Chargement..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="app-layout">
      {/* Sidebar — desktop */}
      <aside className={`app-sidebar hidden lg:flex flex-col`}>
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
          <Link href="/family/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-sm font-extrabold text-text">ToumAnina</span>
          </Link>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <Link href="/family/alerts" className="relative">
                <Bell className="w-5 h-5 text-text-muted" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-bg text-text-muted hover:text-text transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
