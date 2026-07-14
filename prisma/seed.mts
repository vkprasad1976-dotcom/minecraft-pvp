import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const players = [
  { username: "DragonSlayer99", uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", rank: "Netherite", elo: 2450, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Champion", country: "US", notes: "Season 1 champion. Extremely aggressive playstyle." },
  { username: "xXNetherKingXx", uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901", rank: "Netherite", elo: 2380, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Diamond", country: "DE", notes: "Known for clutch plays." },
  { username: "CreeperHunter42", uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012", rank: "Diamond", elo: 2310, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Diamond", country: "GB", notes: "" },
  { username: "EnderPearl_Pro", uuid: "d4e5f6a7-b8c9-0123-defa-234567890123", rank: "Diamond", elo: 2250, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Gold", country: "JP", notes: "Pearl clutch specialist." },
  { username: "PvPMaster2024", elo: 2190, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Gold", country: "KR" },
  { username: "BlazeRod_Warrior", elo: 2130, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Gold", country: "BR" },
  { username: "VoidWalker_X", elo: 2070, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Silver", country: "CA" },
  { username: "WitherSkeleton1", elo: 2010, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Silver", country: "AU" },
  { username: "DiamondSword321", elo: 1960, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Silver", country: "FR" },
  { username: "ObsidianTitan", elo: 1910, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Bronze", country: "US" },
  { username: "EnchantedBow77", elo: 1860, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Bronze", country: "IN" },
  { username: "GhastTears_OP", elo: 1810, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Bronze", country: "SE" },
  { username: "TNT_Expert55", elo: 1760, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: "Bronze", country: "NL" },
  { username: "IronGolem_Fist", elo: 1710, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "RU" },
  { username: "SpectralArrow_X", elo: 1660, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "MX" },
  { username: "EmeraldWarrior", elo: 1610, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "IT" },
  { username: "ShulkerBox_Pro", elo: 1560, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "ES" },
  { username: "PotionMaster_9", elo: 1510, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "PL" },
  { username: "RedstoneNinja", elo: 1460, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "KR" },
  { username: "BedrockBreaker", elo: 1200, wins: 0, losses: 0, kills: 0, deaths: 0, winStreak: 0, badge: null, country: "US" },
];

const announcements = [
  {
    title: "Welcome to the Arena!",
    content: "Welcome to the Minecraft PvP Community! We're excited to launch our brand new leaderboard and player tracking system. Compete, climb the ranks, and prove you're the best PvPer in the server!",
    author: "Admin",
    category: "General",
    pinned: true,
  },
  {
    title: "Season 1 Rankings Are Live",
    content: "Season 1 rankings are now official! All player ELO ratings have been calculated based on recent match results. Check the leaderboard to see where you stand. Top 10 players will receive exclusive in-game rewards!",
    author: "Admin",
    category: "Update",
    pinned: false,
  },
  {
    title: "New Duel Mode: UHC",
    content: "We've added a brand new UHC duel mode! Fight with no regeneration in a tense battle to the death. Available every Friday and Saturday evening. Queue up and test your skills!",
    author: "Moderator_Jake",
    category: "Update",
    pinned: false,
  },
  {
    title: "Community Tournament - July 2026",
    content: "Sign-ups for the July community tournament are now open! 1v1 single elimination bracket with a prize pool of $50 in gift cards. Sign up on our Discord server before July 25th!",
    author: "Admin",
    category: "Tournament",
    pinned: true,
  },
  {
    title: "Bug Fixes and Updates",
    content: "We've patched several issues this week: fixed ELO calculation discrepancies, updated the head skin cache system, and improved mobile responsiveness on the leaderboard page. Keep reporting bugs!",
    author: "Admin",
    category: "Bug Fix",
    pinned: false,
  },
];

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword },
  });

  for (const player of players) {
    await prisma.player.upsert({
      where: { username: player.username },
      update: {},
      create: player,
    });
  }

  for (const announcement of announcements) {
    const existing = await prisma.announcement.findFirst({ where: { title: announcement.title } });
    if (!existing) {
      await prisma.announcement.create({ data: announcement });
    }
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
