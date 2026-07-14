import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }
  return NextResponse.json(player);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdminFromRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { username, uuid, rank, elo, wins, losses, kills, deaths, winStreak, badge, country, notes } = body;

    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const updated = await prisma.player.update({
      where: { id },
      data: {
        ...(username !== undefined && { username }),
        ...(uuid !== undefined && { uuid: uuid || null }),
        ...(rank !== undefined && { rank: rank || null }),
        ...(elo !== undefined && { elo }),
        ...(wins !== undefined && { wins }),
        ...(losses !== undefined && { losses }),
        ...(kills !== undefined && { kills }),
        ...(deaths !== undefined && { deaths }),
        ...(winStreak !== undefined && { winStreak }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(country !== undefined && { country: country || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdminFromRequest(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
