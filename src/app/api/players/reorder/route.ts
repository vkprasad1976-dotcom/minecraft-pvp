import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orders } = await request.json() as { orders: { id: string; sortOrder: number }[] };

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    for (const item of orders) {
      await prisma.player.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
