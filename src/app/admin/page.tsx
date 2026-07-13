"use client";

import { useState, useEffect, useCallback } from "react";

interface Player {
  id: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  badge: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [tab, setTab] = useState<"players" | "announcements">("players");
  const [players, setPlayers] = useState<Player[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [newPlayer, setNewPlayer] = useState({ username: "", elo: 1200, wins: 0, losses: 0, kills: 0, deaths: 0, badge: "" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", author: "Admin", pinned: false });

  const [message, setMessage] = useState("");

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch("/api/announcements");
    if (res.ok) setAnnouncements(await res.json());
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => setPlayers(data))
      .catch(() => {});

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => setAnnouncements(data))
      .catch(() => {});
  }, [loggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setLoggedIn(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Login failed");
      }
    } catch {
      setLoginError("Network error");
    }
  };

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPlayer, badge: newPlayer.badge || null }),
    });
    if (res.ok) {
      setNewPlayer({ username: "", elo: 1200, wins: 0, losses: 0, kills: 0, deaths: 0, badge: "" });
      fetchPlayers();
      showMsg("Player created!");
    } else {
      const d = await res.json();
      showMsg(d.error || "Failed");
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    const res = await fetch(`/api/players/${editingPlayer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingPlayer, badge: editingPlayer.badge || null }),
    });
    if (res.ok) {
      setEditingPlayer(null);
      fetchPlayers();
      showMsg("Player updated!");
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPlayers();
      showMsg("Player deleted");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement),
    });
    if (res.ok) {
      setNewAnnouncement({ title: "", content: "", author: "Admin", pinned: false });
      fetchAnnouncements();
      showMsg("Announcement created!");
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        author: editingAnnouncement.author,
        pinned: editingAnnouncement.pinned,
      }),
    });
    if (res.ok) {
      setEditingAnnouncement(null);
      fetchAnnouncements();
      showMsg("Announcement updated!");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAnnouncements();
      showMsg("Announcement deleted");
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md animate-fade-in-up">
          <h1 className="text-2xl font-bold purple-neon-text text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-white"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-purple-glow/20 border border-purple-glow/50 font-bold hover:bg-purple-glow/30 transition-all"
            >
              Login
            </button>
            <p className="text-xs text-gray-500 text-center">Default: admin / admin123</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Admin Dashboard</h1>
        <button onClick={() => setLoggedIn(false)} className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
          Logout
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-purple-glow/20 border border-purple-glow/40 text-purple-neon text-sm animate-fade-in-up">
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(["players", "announcements"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t
                ? "bg-purple-glow/20 border border-purple-glow/50 text-purple-neon"
                : "border border-gray-700 text-gray-400 hover:border-purple-glow/30"
            }`}
          >
            {t === "players" ? `Players (${players.length})` : `Announcements (${announcements.length})`}
          </button>
        ))}
      </div>

      {tab === "players" && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">{editingPlayer ? "Edit Player" : "Add Player"}</h2>
            <form onSubmit={editingPlayer ? handleUpdatePlayer : handleCreatePlayer} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                placeholder="Username"
                value={editingPlayer?.username ?? newPlayer.username}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, username: e.target.value })
                    : setNewPlayer({ ...newPlayer, username: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
                required
              />
              <input
                type="number"
                placeholder="ELO"
                value={editingPlayer?.elo ?? newPlayer.elo}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, elo: +e.target.value })
                    : setNewPlayer({ ...newPlayer, elo: +e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Wins"
                value={editingPlayer?.wins ?? newPlayer.wins}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, wins: +e.target.value })
                    : setNewPlayer({ ...newPlayer, wins: +e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Losses"
                value={editingPlayer?.losses ?? newPlayer.losses}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, losses: +e.target.value })
                    : setNewPlayer({ ...newPlayer, losses: +e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Kills"
                value={editingPlayer?.kills ?? newPlayer.kills}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, kills: +e.target.value })
                    : setNewPlayer({ ...newPlayer, kills: +e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              />
              <input
                type="number"
                placeholder="Deaths"
                value={editingPlayer?.deaths ?? newPlayer.deaths}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, deaths: +e.target.value })
                    : setNewPlayer({ ...newPlayer, deaths: +e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              />
              <select
                value={editingPlayer?.badge ?? newPlayer.badge}
                onChange={(e) =>
                  editingPlayer
                    ? setEditingPlayer({ ...editingPlayer, badge: e.target.value || null })
                    : setNewPlayer({ ...newPlayer, badge: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
              >
                <option value="">No Badge</option>
                <option value="Champion">Champion</option>
                <option value="Diamond">Diamond</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 rounded-lg bg-purple-glow/20 border border-purple-glow/50 font-bold hover:bg-purple-glow/30 text-sm transition-all">
                  {editingPlayer ? "Update" : "Add"}
                </button>
                {editingPlayer && (
                  <button type="button" onClick={() => setEditingPlayer(null)} className="px-3 py-2 rounded-lg border border-gray-600 text-sm hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-glow/20">
                    <th className="py-3 px-3 text-left text-purple-neon font-bold">Player</th>
                    <th className="py-3 px-3 text-center text-purple-neon font-bold">ELO</th>
                    <th className="py-3 px-3 text-center text-purple-neon font-bold">W/L</th>
                    <th className="py-3 px-3 text-center text-purple-neon font-bold hidden sm:table-cell">K/D</th>
                    <th className="py-3 px-3 text-center text-purple-neon font-bold hidden sm:table-cell">Badge</th>
                    <th className="py-3 px-3 text-center text-purple-neon font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-b border-purple-glow/10 hover:bg-purple-glow/5 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://mc-heads.net/avatar/${p.username}/24`} alt="" width={24} height={24} className="rounded" />
                          {p.username}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold purple-neon-text">{p.elo}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-green-400">{p.wins}</span>/<span className="text-red-400">{p.losses}</span>
                      </td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        {p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell">{p.badge ?? "—"}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => setEditingPlayer(p)} className="px-2 py-1 rounded text-xs bg-purple-glow/20 hover:bg-purple-glow/30 transition-all">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePlayer(p.id)} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">{editingAnnouncement ? "Edit Announcement" : "New Announcement"}</h2>
            <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} className="space-y-3">
              <input
                placeholder="Title"
                value={editingAnnouncement?.title ?? newAnnouncement.title}
                onChange={(e) =>
                  editingAnnouncement
                    ? setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })
                    : setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
                required
              />
              <textarea
                placeholder="Content"
                rows={3}
                value={editingAnnouncement?.content ?? newAnnouncement.content}
                onChange={(e) =>
                  editingAnnouncement
                    ? setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })
                    : setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm resize-none"
                required
              />
              <div className="flex gap-3">
                <input
                  placeholder="Author"
                  value={editingAnnouncement?.author ?? newAnnouncement.author}
                  onChange={(e) =>
                    editingAnnouncement
                      ? setEditingAnnouncement({ ...editingAnnouncement, author: e.target.value })
                      : setNewAnnouncement({ ...newAnnouncement, author: e.target.value })
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-sm"
                />
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-purple-glow/30 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editingAnnouncement?.pinned ?? newAnnouncement.pinned}
                    onChange={(e) =>
                      editingAnnouncement
                        ? setEditingAnnouncement({ ...editingAnnouncement, pinned: e.target.checked })
                        : setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })
                    }
                    className="accent-purple-500"
                  />
                  Pinned
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2 rounded-lg bg-purple-glow/20 border border-purple-glow/50 font-bold hover:bg-purple-glow/30 text-sm transition-all">
                  {editingAnnouncement ? "Update" : "Create"}
                </button>
                {editingAnnouncement && (
                  <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-4 py-2 rounded-lg border border-gray-600 text-sm hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className={`glass-card p-4 ${a.pinned ? "purple-glow-border" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.pinned && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">PINNED</span>}
                      <h3 className="font-bold truncate">{a.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{a.content}</p>
                    <div className="text-xs text-gray-500 mt-1">By {a.author}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditingAnnouncement(a)} className="px-2 py-1 rounded text-xs bg-purple-glow/20 hover:bg-purple-glow/30 transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(a.id)} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
