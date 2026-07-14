"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { authHeaders, clearAdminToken } from "@/lib/client-auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE", headers: { ...authHeaders() } });
    clearAdminToken();
    window.location.href = "/admin/login";
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-purple-glow/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-glow/20 border border-purple-glow/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-neon" />
          </div>
          <div>
            <div className="font-bold purple-neon-text text-sm">PvP Arena</div>
            <div className="text-[11px] text-gray-500">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-purple-glow/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0B0B12]">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-sidebar-bg border-r border-purple-glow/10">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar-bg border-r border-purple-glow/10 animate-fade-in-left">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-purple-glow/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-sidebar-bg/80 backdrop-blur-lg border-b border-purple-glow/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-purple-glow/10 text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-medium text-gray-400">
            {navItems.find((n) => isActive(n.href))?.label || "Admin"}
          </h2>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
