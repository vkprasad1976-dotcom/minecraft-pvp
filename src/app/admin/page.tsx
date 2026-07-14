"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import {
  Users,
  Megaphone,
  Clock,
  Activity,
  TrendingUp,
  Flame,
  Plus,
  X,
} from "lucide-react";

interface Player {
  id: string;
  username: string;
  elo: number;
  sortOrder: number;
  wins: number;
  losses: number;
  badge: string | null;
  createdAt: string;
}

interface Announcement {
  title: string;
  createdAt: string;
  pinned: boolean;
}

interface Stats {
  totalPlayers: number;
  totalAnnouncements: number;
  topElo: number;
  recentPlayers: Player[];
  recentAnnouncements: Announcement[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: "", elo: 1200 });
  const [message, setMessage] = useState("");
  const [editingBadge, setEditingBadge] = useState<string | null>(null);
  const [editingElo, setEditingElo] = useState<string | null>(null);

  const load = async () => {
    try {
      const [playersRes, announcementsRes] = await Promise.all([
        fetch("/api/players"),
        fetch("/api/announcements"),
      ]);
      const players: Player[] = await playersRes.json();
      const announcements: Announcement[] = await announcementsRes.json();

      const sorted = [...players].sort((a, b) => a.sortOrder - b.sortOrder);

      setStats({
        totalPlayers: players.length,
        totalAnnouncements: announcements.length,
        topElo: sorted[0]?.elo || 0,
        recentPlayers: sorted.slice(0, 5),
        recentAnnouncements: announcements.slice(0, 5),
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.username, elo: Number(form.elo) }),
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ username: "", elo: 1200 });
      load();
      showMsg("Player added!");
    } else {
      const d = await res.json();
      showMsg(d.error || "Failed to add player");
    }
  };

  const handleBadgeChange = async (id: string, badge: string) => {
    setEditingBadge(null);
    const res = await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badge: badge || null }),
    });
    if (res.ok) {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              recentPlayers: prev.recentPlayers.map((p) =>
                p.id === id ? { ...p, badge: badge || null } : p
              ),
            }
          : prev
      );
    }
  };

  const handleEloChange = async (id: string, elo: number) => {
    setEditingElo(null);
    const res = await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elo }),
    });
    if (res.ok) {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              recentPlayers: prev.recentPlayers.map((p) =>
                p.id === id ? { ...p, elo } : p
              ),
            }
          : prev
      );
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Overview of your PvP Arena</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="admin-btn admin-btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-purple-glow/20 border border-purple-glow/40 text-purple-neon text-sm animate-slide-in">
            {message}
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <div className="relative glass-card-static p-6 w-full max-w-md animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Add New Player</h2>
                <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-purple-glow/10 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minecraft Username *</label>
                  <input
                    placeholder="e.g. DragonSlayer99"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="admin-input"
                    required
                    autoFocus
                  />
                  {form.username && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://mc-heads.net/avatar/${form.username}/32`}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      Preview
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Starting ELO</label>
                  <input
                    type="number"
                    value={form.elo}
                    onChange={(e) => setForm({ ...form, elo: +e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="admin-btn admin-btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary flex-1">
                    Add Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card animate-shimmer h-32" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Players",
                  value: stats.totalPlayers,
                  icon: Users,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                },
                {
                  label: "Announcements",
                  value: stats.totalAnnouncements,
                  icon: Megaphone,
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                },
                {
                  label: "Top ELO",
                  value: stats.topElo.toLocaleString(),
                  icon: TrendingUp,
                  color: "text-purple-neon",
                  bg: "bg-purple-glow/10",
                },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className="stat-card animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{card.label}</span>
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card-static p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <h2 className="font-bold">Top 5 Players</h2>
                  </div>
                  <Link href="/admin/leaderboard" className="text-xs text-purple-neon hover:underline">
                    Manage →
                  </Link>
                </div>
                <div className="space-y-2">
                  {stats.recentPlayers.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10"
                    >
                      <span className={`w-6 text-center font-bold text-sm ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-500"
                      }`}>
                        {i + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://mc-heads.net/avatar/${p.username}/32`}
                        alt={p.username}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.username}</div>
                      </div>
                      {editingBadge === p.id ? (
                        <select
                          autoFocus
                          value={p.badge || ""}
                          onChange={(e) => handleBadgeChange(p.id, e.target.value)}
                          onBlur={() => setEditingBadge(null)}
                          className="admin-input text-xs py-1 px-2 w-24"
                        >
                          <option value="">No Badge</option>
                          <option value="Champion">Champion</option>
                          <option value="Diamond">Diamond</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                          <option value="Bronze">Bronze</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingBadge(p.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to edit badge"
                        >
                          {p.badge ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600 hover:text-gray-400">+ badge</span>
                          )}
                        </button>
                      )}
                      {editingElo === p.id ? (
                        <input
                          type="number"
                          autoFocus
                          defaultValue={p.elo}
                          onBlur={(e) => handleEloChange(p.id, Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") setEditingElo(null);
                          }}
                          className="admin-input text-xs py-1 px-2 w-20 text-center font-bold"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingElo(p.id)}
                          className="text-sm font-bold purple-neon-text hover:opacity-80 transition-opacity cursor-pointer"
                          title="Click to edit ELO"
                        >
                          {p.elo}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {stats.totalPlayers > 5 && (
                  <div className="mt-3 text-center">
                    <Link href="/admin/leaderboard" className="text-xs text-gray-500 hover:text-purple-neon transition-colors">
                      +{stats.totalPlayers - 5} more players
                    </Link>
                  </div>
                )}
              </div>

              <div className="glass-card-static p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h2 className="font-bold">Recent Announcements</h2>
                  </div>
                  <Link href="/admin/announcements" className="text-xs text-purple-neon hover:underline">
                    Manage →
                  </Link>
                </div>
                <div className="space-y-2">
                  {stats.recentAnnouncements.map((a) => (
                    <div
                      key={a.title}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{a.title}</span>
                          {a.pinned && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                              PINNED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 glass-card-static p-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminSidebar>
  );
}
