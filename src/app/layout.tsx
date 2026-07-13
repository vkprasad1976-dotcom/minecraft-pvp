import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minecraft PvP Arena - Leaderboard & Community",
  description: "The ultimate Minecraft PvP community. Track stats, climb the leaderboard, and prove your dominance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-minecraft-grid">
        <nav className="sticky top-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-purple-glow/20 border border-purple-glow/50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  ⚔
                </div>
                <span className="text-xl font-bold purple-neon-text hidden sm:block">
                  PvP Arena
                </span>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-glow/10 hover:text-purple-neon transition-all"
                >
                  Home
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-glow/10 hover:text-purple-neon transition-all"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/announcements"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-glow/10 hover:text-purple-neon transition-all"
                >
                  News
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-glow/10 border border-purple-glow/30 hover:bg-purple-glow/20 hover:border-purple-glow/50 transition-all"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="glass-card border-b-0 border-x-0 rounded-none py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>Minecraft PvP Arena &copy; 2026. Not affiliated with Mojang.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
