"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

interface Player {
  id: string;
  username: string;
  uuid: string | null;
  rank: string | null;
  elo: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  winStreak: number;
  badge: string | null;
  country: string | null;
  notes: string | null;
}

const emptyPlayer = {
  username: "",
  uuid: "",
  rank: "",
  elo: 1200,
  wins: 0,
  losses: 0,
  kills: 0,
  deaths: 0,
  winStreak: 0,
  badge: "",
  country: "",
  notes: "",
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyPlayer);
  const [message, setMessage] = useState("");

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) {
      setPlayers(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openCreate = () => {
    setEditingPlayer(null);
    setForm(emptyPlayer);
    setShowForm(true);
  };

  const openEdit = (p: Player) => {
    setEditingPlayer(p);
    setForm({
      username: p.username,
      uuid: p.uuid || "",
      rank: p.rank || "",
      elo: p.elo,
      wins: p.wins,
      losses: p.losses,
      kills: p.kills,
      deaths: p.deaths,
      winStreak: p.winStreak,
      badge: p.badge || "",
      country: p.country || "",
      notes: p.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      elo: Number(form.elo),
      wins: Number(form.wins),
      losses: Number(form.losses),
      kills: Number(form.kills),
      deaths: Number(form.deaths),
      winStreak: Number(form.winStreak),
      badge: form.badge || null,
      uuid: form.uuid || null,
      rank: form.rank || null,
      country: form.country || null,
      notes: form.notes || null,
    };

    const url = editingPlayer ? `/api/players/${editingPlayer.id}` : "/api/players";
    const method = editingPlayer ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingPlayer(null);
      setForm(emptyPlayer);
      fetchPlayers();
      showMsg(editingPlayer ? "Player updated!" : "Player created!");
    } else {
      const d = await res.json();
      showMsg(d.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player? This cannot be undone.")) return;
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPlayers();
      showMsg("Player deleted");
    }
  };

  const filtered = players.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    (p.country && p.country.toLowerCase().includes(search.toLowerCase())) ||
    (p.badge && p.badge.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Players</h1>
            <p className="text-gray-500 mt-1 text-sm">{players.length} total players</p>
          </div>
          <button onClick={openCreate} className="admin-btn admin-btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-purple-glow/20 border border-purple-glow/40 text-purple-neon text-sm animate-slide-in">
            {message}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="relative glass-card-static p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editingPlayer ? "Edit Player" : "Add Player"}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-purple-glow/10 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Username *</label>
                    <input
                      placeholder="Minecraft Username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">UUID</label>
                    <input
                      placeholder="Player UUID (optional)"
                      value={form.uuid}
                      onChange={(e) => setForm({ ...form, uuid: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rank</label>
                    <select
                      value={form.rank}
                      onChange={(e) => setForm({ ...form, rank: e.target.value })}
                      className="admin-input"
                    >
                      <option value="">No Rank</option>
                      <option value="Iron">Iron</option>
                      <option value="Gold">Gold</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Netherite">Netherite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ELO</label>
                    <input
                      type="number"
                      value={form.elo}
                      onChange={(e) => setForm({ ...form, elo: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Wins</label>
                    <input
                      type="number"
                      value={form.wins}
                      onChange={(e) => setForm({ ...form, wins: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Losses</label>
                    <input
                      type="number"
                      value={form.losses}
                      onChange={(e) => setForm({ ...form, losses: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kills</label>
                    <input
                      type="number"
                      value={form.kills}
                      onChange={(e) => setForm({ ...form, kills: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Deaths</label>
                    <input
                      type="number"
                      value={form.deaths}
                      onChange={(e) => setForm({ ...form, deaths: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Win Streak</label>
                    <input
                      type="number"
                      value={form.winStreak}
                      onChange={(e) => setForm({ ...form, winStreak: +e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Badge</label>
                    <select
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="admin-input"
                    >
                      <option value="">No Badge</option>
                      <option value="Champion">Champion</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Bronze">Bronze</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Country</label>
                    <input
                      placeholder="e.g. US, DE, JP"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea
                    placeholder="Internal notes about this player..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="admin-input resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {form.username && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
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
                  <div className="flex-1" />
                  <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingPlayer ? "Update Player" : "Create Player"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
        </div>

        <div className="glass-card-static overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-glow/20">
                  <th className="py-3 px-3 sm:px-4 text-left text-purple-neon font-bold">Player</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden sm:table-cell">Rank</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">ELO</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">W/L</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden md:table-cell">K/D</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden lg:table-cell">Streak</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden lg:table-cell">Badge</th>
                  <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      Loading players...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      {search ? "No players match your search" : "No players yet"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-purple-glow/10 hover:bg-purple-glow/5 transition-colors">
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://mc-heads.net/avatar/${p.username}/32`}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{p.username}</div>
                            {p.country && (
                              <div className="text-xs text-gray-500">{p.country}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-sm hidden sm:table-cell">
                        {p.rank || "—"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center font-bold purple-neon-text">
                        {p.elo}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span className="text-green-400">{p.wins}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-red-400">{p.losses}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">
                        {p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills > 0 ? p.kills.toFixed(2) : "0.00"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                        {p.winStreak > 0 ? (
                          <span className="text-amber-400 font-bold">{p.winStreak}</span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                        {p.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                            {p.badge}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-purple-glow/20 text-purple-neon transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
