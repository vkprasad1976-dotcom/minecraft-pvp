import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold purple-neon-text mb-2">
          Announcements
        </h1>
        <p className="text-gray-400">Latest news and updates from the community</p>
      </div>

      <div className="grid gap-6">
        {announcements.map((a, i) => (
          <div
            key={a.id}
            className={`glass-card p-6 sm:p-8 animate-fade-in-up ${
              a.pinned ? "purple-glow-border" : ""
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                {a.pinned && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon mb-2">
                    Pinned
                  </span>
                )}
                <h2 className="text-xl font-bold">{a.title}</h2>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">{a.content}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-gray-400">{a.author}</span>
              <span>·</span>
              <span>{new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
