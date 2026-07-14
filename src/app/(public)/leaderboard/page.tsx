"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";

interface Player {
  id: string;
  username: string;
  elo: number;
  badge: string | null;
  country: string | null;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => setPlayers(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      players.filter(
        (p) =>
          p.username.toLowerCase().includes(search.toLowerCase()) ||
          (p.badge && p.badge.toLowerCase().includes(search.toLowerCase())) ||
          (p.country && p.country.toLowerCase().includes(search.toLowerCase()))
      ),
    [players, search]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold purple-neon-text mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-400">Top PvP players ranked by ELO</p>
      </div>

      <div className="max-w-md mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-white text-sm"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-glow/20">
                <th className="py-3 px-3 sm:px-4 text-left text-purple-neon font-bold">#</th>
                <th className="py-3 px-3 sm:px-4 text-left text-purple-neon font-bold">Player</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden sm:table-cell">ELO</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">Badge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">Loading players...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    {search ? "No players match your search" : "No players yet"}
                  </td>
                </tr>
              ) : (
                filtered.map((player, i) => {
                  const badgeColor =
                    player.badge === "Champion"
                      ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10"
                      : player.badge === "Diamond"
                      ? "text-cyan-400 border-cyan-400/40 bg-cyan-400/10"
                      : player.badge === "Gold"
                      ? "text-amber-400 border-amber-400/40 bg-amber-400/10"
                      : player.badge === "Silver"
                      ? "text-gray-300 border-gray-300/40 bg-gray-300/10"
                      : player.badge === "Bronze"
                      ? "text-orange-400 border-orange-400/40 bg-orange-400/10"
                      : "text-gray-400 border-gray-400/20 bg-gray-400/5";

                  return (
                    <tr
                      key={player.id}
                      className="border-b border-purple-glow/10 hover:bg-purple-glow/5 transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-4 font-bold text-gray-500">
                        {i < 3 ? (
                          <span className={i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : "text-orange-400"}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <Link href={`/player/${player.username}`} className="flex items-center gap-3 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://mc-heads.net/avatar/${player.username}/32`}
                            alt={player.username}
                            width={32}
                            height={32}
                            className="rounded pixel-border group-hover:scale-110 transition-transform"
                          />
                          <span className="font-medium group-hover:text-purple-neon transition-colors">
                            {player.username}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center font-bold purple-neon-text hidden sm:table-cell">
                        {player.elo}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        {player.badge ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                            {player.badge}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
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
  );
}
