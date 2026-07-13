import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const players = [
  { username: "DragonSlayer99", elo: 2450, wins: 312, losses: 87, kills: 1893, deaths: 542, badge: "Champion" },
  { username: "xXNetherKingXx", elo: 2380, wins: 289, losses: 94, kills: 1756, deaths: 598, badge: "Diamond" },
  { username: "CreeperHunter42", elo: 2310, wins: 267, losses: 103, kills: 1634, deaths: 631, badge: "Diamond" },
  { username: "EnderPearl_Pro", elo: 2250, wins: 245, losses: 112, kills: 1523, deaths: 687, badge: "Gold" },
  { username: "PvPMaster2024", elo: 2190, wins: 231, losses: 119, kills: 1456, deaths: 712, badge: "Gold" },
  { username: "BlazeRod_Warrior", elo: 2130, wins: 218, losses: 127, kills: 1389, deaths: 756, badge: "Gold" },
  { username: "VoidWalker_X", elo: 2070, wins: 204, losses: 136, kills: 1312, deaths: 798, badge: "Silver" },
  { username: "WitherSkeleton1", elo: 2010, wins: 192, losses: 143, kills: 1245, deaths: 834, badge: "Silver" },
  { username: "DiamondSword321", elo: 1960, wins: 181, losses: 151, kills: 1189, deaths: 878, badge: "Silver" },
  { username: "ObsidianTitan", elo: 1910, wins: 170, losses: 159, kills: 1123, deaths: 912, badge: "Bronze" },
  { username: "EnchantedBow77", elo: 1860, wins: 158, losses: 167, kills: 1067, deaths: 956, badge: "Bronze" },
  { username: "GhastTears_OP", elo: 1810, wins: 147, losses: 174, kills: 998, deaths: 989, badge: "Bronze" },
  { username: "TNT_Expert55", elo: 1760, wins: 135, losses: 182, kills: 934, deaths: 1023, badge: "Bronze" },
  { username: "IronGolem_Fist", elo: 1710, wins: 124, losses: 191, kills: 878, deaths: 1067, badge: null },
  { username: "SpectralArrow_X", elo: 1660, wins: 112, losses: 198, kills: 812, deaths: 1112, badge: null },
  { username: "EmeraldWarrior", elo: 1610, wins: 101, losses: 207, kills: 756, deaths: 1156, badge: null },
  { username: "ShulkerBox_Pro", elo: 1560, wins: 89, losses: 215, kills: 698, deaths: 1198, badge: null },
  { username: "PotionMaster_9", elo: 1510, wins: 78, losses: 224, kills: 634, deaths: 1245, badge: null },
  { username: "RedstoneNinja", elo: 1460, wins: 67, losses: 232, kills: 578, deaths: 1289, badge: null },
  { username: "BedrockBreaker", elo: 1200, wins: 45, losses: 256, kills: 412, deaths: 1389, badge: null },
];

const announcements = [
  {
    title: "Welcome to the Arena!",
    content: "Welcome to the Minecraft PvP Community! We're excited to launch our brand new leaderboard and player tracking system. Compete, climb the ranks, and prove you're the best PvPer in the server!",
    author: "Admin",
    pinned: true,
  },
  {
    title: "Season 1 Rankings Are Live",
    content: "Season 1 rankings are now official! All player ELO ratings have been calculated based on recent match results. Check the leaderboard to see where you stand. Top 10 players will receive exclusive in-game rewards!",
    author: "Admin",
    pinned: false,
  },
  {
    title: "New Duel Mode: UHC",
    content: "We've added a brand new UHC duel mode! Fight with no regeneration in a tense battle to the death. Available every Friday and Saturday evening. Queue up and test your skills!",
    author: "Moderator_Jake",
    pinned: false,
  },
  {
    title: "Community Tournament - July 2026",
    content: "Sign-ups for the July community tournament are now open! 1v1 single elimination bracket with a prize pool of $50 in gift cards. Sign up on our Discord server before July 25th!",
    author: "Admin",
    pinned: true,
  },
  {
    title: "Bug Fixes and Updates",
    content: "We've patched several issues this week: fixed ELO calculation discrepancies, updated the head skin cache system, and improved mobile responsiveness on the leaderboard page. Keep reporting bugs!",
    author: "Admin",
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
