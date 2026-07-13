import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const players = await prisma.player.findMany({
    orderBy: { elo: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold purple-neon-text mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-400">Top PvP players ranked by ELO</p>
      </div>

      <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-glow/20">
                <th className="py-3 px-3 sm:px-4 text-left text-purple-neon font-bold">#</th>
                <th className="py-3 px-3 sm:px-4 text-left text-purple-neon font-bold">Player</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden sm:table-cell">ELO</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">W</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold">L</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden md:table-cell">Kills</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden md:table-cell">Deaths</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden lg:table-cell">K/D</th>
                <th className="py-3 px-3 sm:px-4 text-center text-purple-neon font-bold hidden lg:table-cell">Badge</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, i) => {
                const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
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
                    <td className="py-3 px-3 sm:px-4 text-center text-green-400">
                      {player.wins}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center text-red-400">
                      {player.losses}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">
                      {player.kills}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center hidden md:table-cell">
                      {player.deaths}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center font-mono hidden lg:table-cell">
                      {kd}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
