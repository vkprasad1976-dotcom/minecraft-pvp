import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author, pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        author: author || "Admin",
        pinned: pinned ?? false,
      },
    });

    return NextResponse.json(announcement);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
