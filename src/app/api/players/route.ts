import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, uuid, rank, elo, sortOrder, wins, losses, kills, deaths, winStreak, badge, country, notes } = body;

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const existing = await prisma.player.findFirst({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Player already exists" }, { status: 409 });
    }

    const player = await prisma.player.create({
      data: {
        username,
        uuid: uuid || null,
        rank: rank || null,
        elo: elo ?? 1200,
        sortOrder: sortOrder ?? 0,
        wins: wins ?? 0,
        losses: losses ?? 0,
        kills: kills ?? 0,
        deaths: deaths ?? 0,
        winStreak: winStreak ?? 0,
        badge: badge ?? null,
        country: country || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(player);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
