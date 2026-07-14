import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [topPlayers, totalPlayers, totalAnnouncements, latestAnnouncements] =
    await Promise.all([
      prisma.player.findMany({
        orderBy: { sortOrder: "asc" },
        take: 5,
      }),
      prisma.player.count(),
      prisma.announcement.count(),
      prisma.announcement.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
    ]);

  const topElo = topPlayers[0]?.elo ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Overview of the PvP Arena
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Players",
            value: totalPlayers,
            icon: "👤",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Announcements",
            value: totalAnnouncements,
            icon: "📢",
            color: "text-green-400",
            bg: "bg-green-400/10",
          },
          {
            label: "Top ELO",
            value: topElo.toLocaleString(),
            icon: "📈",
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
                <span className={`${card.color}`}>{card.icon}</span>
              </div>
            </div>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div
          className="glass-card p-6 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Top 5 Players</h2>
            <Link
              href="/leaderboard"
              className="text-xs text-purple-neon hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {topPlayers.map((p, i) => (
              <Link
                key={p.id}
                href={`/player/${p.username}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10 hover:bg-purple-glow/5 transition-colors"
              >
                <span
                  className={`w-6 text-center font-bold text-sm ${
                    i === 0
                      ? "text-yellow-400"
                      : i === 1
                      ? "text-gray-300"
                      : i === 2
                      ? "text-orange-400"
                      : "text-gray-500"
                  }`}
                >
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
                  <div className="font-medium text-sm truncate">
                    {p.username}
                  </div>
                </div>
                {p.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                    {p.badge}
                  </span>
                )}
                <div className="text-sm font-bold purple-neon-text">
                  {p.elo}
                </div>
              </Link>
            ))}
          </div>
          {totalPlayers > 5 && (
            <div className="mt-3 text-center">
              <Link
                href="/leaderboard"
                className="text-xs text-gray-500 hover:text-purple-neon transition-colors"
              >
                +{totalPlayers - 5} more players
              </Link>
            </div>
          )}
        </div>

        <div
          className="glass-card p-6 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent Announcements</h2>
            <Link
              href="/announcements"
              className="text-xs text-purple-neon hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {latestAnnouncements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {a.title}
                    </span>
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
    </div>
  );
}
