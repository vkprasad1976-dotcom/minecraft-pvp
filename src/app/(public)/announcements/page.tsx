"use client";

import { useState, useEffect } from "react";
import { Search, Pin } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2 text-purple-neon">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 text-purple-neon">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-purple-neon">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-200">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-purple-glow/20 text-purple-neon text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300">• $1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-300">$1. $2</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-purple-neon underline hover:text-purple-glow">$1</a>')
    .replace(/\n/g, "<br />");
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => setAnnouncements(data))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(announcements.map((a) => a.category))];

  const filtered = announcements
    .filter(
      (a) =>
        (filter === "All" || a.category === filter) &&
        (a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.content.toLowerCase().includes(search.toLowerCase()) ||
          a.author.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold purple-neon-text mb-2">
          Announcements
        </h1>
        <p className="text-gray-400">Latest news and updates from the community</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/30 border border-purple-glow/30 focus:border-purple-glow outline-none text-white text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === cat
                  ? "bg-purple-glow/20 border border-purple-glow/50 text-purple-neon"
                  : "border border-gray-700 text-gray-400 hover:border-purple-glow/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="glass-card p-12 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500">
            {search || filter !== "All" ? "No announcements match your filters" : "No announcements yet"}
          </div>
        ) : (
          filtered.map((a, i) => (
            <div
              key={a.id}
              className={`glass-card p-6 sm:p-8 animate-fade-in-up ${
                a.pinned ? "purple-glow-border" : ""
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {a.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700/50 border border-gray-600/50 text-gray-400">
                      {a.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{a.title}</h2>
                </div>
              </div>
              <div className="text-gray-300 leading-relaxed mb-4 text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.content) }} />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-400">{a.author}</span>
                <span>·</span>
                <span>{new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
