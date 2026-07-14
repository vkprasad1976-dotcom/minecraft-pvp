"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import { ExternalLink, Trash2, Plus, X, GripVertical } from "lucide-react";

interface Player {
  id: string;
  username: string;
  elo: number;
  sortOrder: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  badge: string | null;
}

export default function AdminLeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: "", elo: 1200 });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [editingBadge, setEditingBadge] = useState<string | null>(null);
  const [editingElo, setEditingElo] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) {
      const data = await res.json();
      setPlayers(data.sort((a: Player, b: Player) => a.sortOrder - b.sortOrder));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveOrder = async (reordered: Player[]) => {
    const orders = reordered.map((p, i) => ({ id: p.id, sortOrder: i }));
    try {
      const res = await fetch("/api/players/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (res.ok) showMsg("Leaderboard reordered!");
    } catch {
      loadPlayers();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxOrder = players.length > 0 ? Math.max(...players.map((p) => p.sortOrder)) : 0;
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        elo: Number(form.elo),
        sortOrder: maxOrder + 1,
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ username: "", elo: 1200 });
      loadPlayers();
      showMsg("Player added to leaderboard!");
    } else {
      const d = await res.json();
      showMsg(d.error || "Failed");
    }
  };

  const handleRemove = async (id: string, username: string) => {
    if (!confirm(`Remove ${username} from the leaderboard?`)) return;
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadPlayers();
      showMsg(`${username} removed`);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDragIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIdx;
    setDragIdx(null);
    setOverIdx(null);

    if (fromIndex === null || fromIndex === dropIndex) return;

    setPlayers((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(dropIndex, 0, moved);
      const reordered = updated.map((p, i) => ({ ...p, sortOrder: i }));
      saveOrder(reordered);
      return reordered;
    });
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleBadgeChange = async (id: string, badge: string) => {
    setEditingBadge(null);
    const res = await fetch(`/api/players/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badge: badge || null }),
    });
    if (res.ok) {
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, badge: badge || null } : p)));
      showMsg(badge ? `Badge set to ${badge}` : "Badge removed");
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
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, elo } : p)));
      showMsg(`ELO set to ${elo}`);
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Leaderboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Drag rows to reorder • Add or remove players</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="admin-btn admin-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
            <Link
              href="/leaderboard"
              target="_blank"
              className="admin-btn admin-btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Public View
            </Link>
          </div>
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
                <h2 className="text-lg font-bold">Add Player to Leaderboard</h2>
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
                    Add to Leaderboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="glass-card-static overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-glow/20">
                  <th className="py-3 px-2 sm:px-3 text-center text-purple-neon font-bold w-10">#</th>
                  <th className="py-3 px-2 sm:px-3 text-left text-purple-neon font-bold">Player</th>
                  <th className="py-3 px-2 sm:px-3 text-center text-purple-neon font-bold hidden sm:table-cell">ELO</th>
                  <th className="py-3 px-2 sm:px-3 text-center text-purple-neon font-bold">Badge</th>
                  <th className="py-3 px-2 sm:px-3 text-center text-purple-neon font-bold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : (
                  players.map((p, i) => {
                    const isDragging = dragIdx === i;
                    const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;

                    return (
                      <tr
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={(e) => handleDrop(e, i)}
                        onDragEnd={handleDragEnd}
                        onDragLeave={() => setOverIdx(null)}
                        className={`border-b border-purple-glow/10 transition-colors ${
                          isDragging ? "opacity-30" : ""
                        } ${isOver ? "bg-purple-glow/10 border-t-2 border-t-purple-neon" : "hover:bg-purple-glow/5"}`}
                      >
                        <td className="py-3 px-2 sm:px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <GripVertical className="w-4 h-4 text-gray-600 hidden sm:block" />
                            <span className="font-bold text-gray-500">{i + 1}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://mc-heads.net/avatar/${p.username}/32`}
                              alt=""
                              width={32}
                              height={32}
                              className="rounded"
                            />
                            <span className="font-medium">{p.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
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
                              className="font-bold purple-neon-text hover:opacity-80 transition-opacity cursor-pointer"
                              title="Click to edit ELO"
                            >
                              {p.elo}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {editingBadge === p.id ? (
                            <select
                              autoFocus
                              value={p.badge || ""}
                              onChange={(e) => handleBadgeChange(p.id, e.target.value)}
                              onBlur={() => setEditingBadge(null)}
                              className="admin-input text-xs py-1 px-2 w-28"
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
                                <span className="text-gray-600 hover:text-gray-400 text-xs">—</span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          <button
                            onClick={() => handleRemove(p.id, p.username)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                            title={`Remove ${p.username}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
