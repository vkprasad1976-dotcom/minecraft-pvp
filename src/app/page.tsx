import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const topPlayers = await prisma.player.findMany({
    orderBy: { elo: "desc" },
    take: 5,
  });
  const totalPlayers = await prisma.player.count();
  const totalMatches = await prisma.player.findMany({ select: { wins: true, losses: true } });
  const matches = totalMatches.reduce((acc, p) => acc + p.wins + p.losses, 0);
  const latestAnnouncements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <div className="mb-6">
          <span className="text-6xl sm:text-7xl">⚔</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 purple-neon-text">
          PvP Arena
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          The ultimate Minecraft PvP community. Track your stats, climb the ranks, and prove you&apos;re the best.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/leaderboard"
            className="px-8 py-3 rounded-xl bg-purple-glow/20 border border-purple-glow/50 font-bold hover:bg-purple-glow/30 hover:scale-105 transition-all animate-glow"
          >
            View Leaderboard
          </Link>
          <Link
            href="/announcements"
            className="px-8 py-3 rounded-xl border border-gray-600 font-bold hover:border-purple-glow/50 hover:bg-purple-glow/10 transition-all"
          >
            Latest News
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
        {[
          { label: "Players", value: totalPlayers, icon: "👤" },
          { label: "Total Matches", value: matches.toLocaleString(), icon: "⚔" },
          { label: "Top ELO", value: topPlayers[0]?.elo.toLocaleString() ?? "—", icon: "🏆" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card p-6 text-center animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl sm:text-3xl font-bold purple-neon-text">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Players</h2>
          <Link href="/leaderboard" className="text-sm text-purple-neon hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid gap-4">
          {topPlayers.map((player, i) => (
            <Link
              key={player.id}
              href={`/player/${player.username}`}
              className="glass-card p-4 flex items-center gap-4 hover:scale-[1.01] transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-lg font-bold text-gray-500 w-8 text-center">
                #{i + 1}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc-heads.net/avatar/${player.username}/48`}
                alt={player.username}
                width={48}
                height={48}
                className="rounded-lg pixel-border"
              />
              <div className="flex-1">
                <div className="font-bold">{player.username}</div>
                <div className="text-sm text-gray-400">
                  {player.wins}W / {player.losses}L
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold purple-neon-text">{player.elo}</div>
                <div className="text-xs text-gray-400">ELO</div>
              </div>
              {player.badge && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon hidden sm:inline-block">
                  {player.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {latestAnnouncements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest News</h2>
            <Link href="/announcements" className="text-sm text-purple-neon hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestAnnouncements.map((a, i) => (
              <div
                key={a.id}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {a.pinned && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon mb-3">
                    Pinned
                  </span>
                )}
                <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-3">{a.content}</p>
                <div className="text-xs text-gray-500">
                  By {a.author} · {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
