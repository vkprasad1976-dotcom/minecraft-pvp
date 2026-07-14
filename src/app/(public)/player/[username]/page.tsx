import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const player = await prisma.player.findFirst({
    where: { username: decodeURIComponent(username) },
  });

  if (!player) notFound();

  const allPlayers = await prisma.player.findMany({
    orderBy: { elo: "desc" },
    select: { elo: true },
  });
  const rank = allPlayers.findIndex((p) => p.elo === player.elo) + 1;

  const badgeColor =
    player.badge === "Champion"
      ? "from-yellow-500/20 to-amber-500/20 border-yellow-400/40 text-yellow-400"
      : player.badge === "Diamond"
      ? "from-cyan-500/20 to-blue-500/20 border-cyan-400/40 text-cyan-400"
      : player.badge === "Gold"
      ? "from-amber-500/20 to-yellow-500/20 border-amber-400/40 text-amber-400"
      : player.badge === "Silver"
      ? "from-gray-400/20 to-gray-500/20 border-gray-300/40 text-gray-300"
      : player.badge === "Bronze"
      ? "from-orange-500/20 to-red-500/20 border-orange-400/40 text-orange-400"
      : "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-neon mb-6 transition-colors">
        ← Back to Leaderboard
      </Link>

      <div className="glass-card p-6 sm:p-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${player.username}/128`}
            alt={player.username}
            width={128}
            height={128}
            className="rounded-xl pixel-border animate-float"
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-1 flex-wrap">
              <h1 className="text-3xl font-bold">{player.username}</h1>
              {player.badge && (
                <span className={`px-3 py-1 rounded-full text-sm font-bold border bg-gradient-to-r ${badgeColor}`}>
                  {player.badge}
                </span>
              )}
            </div>
            <div className="text-gray-400 space-x-3">
              <span>Rank <span className="purple-neon-text font-bold">#{rank}</span></span>
              <span>·</span>
              <span>ELO <span className="purple-neon-text font-bold">{player.elo}</span></span>
              {player.country && (
                <>
                  <span>·</span>
                  <span>{player.country}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold purple-neon-text">#{rank}</div>
            <div className="text-xs text-gray-400 mt-1">Global Rank</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold purple-neon-text">{player.elo}</div>
            <div className="text-xs text-gray-400 mt-1">ELO Rating</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{player.winStreak}</div>
            <div className="text-xs text-gray-400 mt-1">Win Streak</div>
          </div>
        </div>

        {player.notes && (
          <div className="glass-card p-4">
            <div className="text-xs text-gray-500 mb-1">Notes</div>
            <p className="text-sm text-gray-300">{player.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
