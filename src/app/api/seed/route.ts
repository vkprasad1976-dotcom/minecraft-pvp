import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  try {
    const seeded = await seedDatabase();
    return NextResponse.json({ message: seeded ? "Database seeded successfully" : "Database already seeded" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
