import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { elo: "desc" },
  });
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, elo, wins, losses, kills, deaths, badge } = body;

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
        elo: elo ?? 1200,
        wins: wins ?? 0,
        losses: losses ?? 0,
        kills: kills ?? 0,
        deaths: deaths ?? 0,
        badge: badge ?? null,
      },
    });

    return NextResponse.json(player);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
