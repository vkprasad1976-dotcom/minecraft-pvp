"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, X, Pin, Search } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { authHeaders } from "@/lib/client-auth";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  pinned: boolean;
  publishDate: string;
  createdAt: string;
}

const emptyAnnouncement = {
  title: "",
  content: "",
  author: "Admin",
  category: "General",
  pinned: false,
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyAnnouncement);
  const [message, setMessage] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch("/api/announcements");
    if (res.ok) {
      setAnnouncements(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const openCreate = () => {
    setEditingAnnouncement(null);
    setForm(emptyAnnouncement);
    setShowForm(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingAnnouncement(a);
    setForm({
      title: a.title,
      content: a.content,
      author: a.author,
      category: a.category,
      pinned: a.pinned,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAnnouncement
      ? `/api/announcements/${editingAnnouncement.id}`
      : "/api/announcements";
    const method = editingAnnouncement ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setEditingAnnouncement(null);
      setForm(emptyAnnouncement);
      fetchAnnouncements();
      showMsg(editingAnnouncement ? "Announcement updated!" : "Announcement created!");
    } else {
      const d = await res.json();
      showMsg(d.error || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
    if (res.ok) {
      fetchAnnouncements();
      showMsg("Announcement deleted");
    }
  };

  const togglePin = async (a: Announcement) => {
    const res = await fetch(`/api/announcements/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ pinned: !a.pinned }),
    });
    if (res.ok) {
      fetchAnnouncements();
      showMsg(a.pinned ? "Announcement unpinned" : "Announcement pinned");
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Announcements</h1>
            <p className="text-gray-500 mt-1 text-sm">{announcements.length} total announcements</p>
          </div>
          <button onClick={openCreate} className="admin-btn admin-btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-purple-glow/20 border border-purple-glow/40 text-purple-neon text-sm animate-slide-in">
            {message}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="relative glass-card-static p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-purple-glow/10 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Title *</label>
                  <input
                    placeholder="Announcement title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Content *</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val })}
                    placeholder="Write your announcement... (supports **bold**, *italic*, # headings, - lists)"
                    rows={10}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Author</label>
                    <input
                      placeholder="Author"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="admin-input"
                    >
                      <option value="General">General</option>
                      <option value="Update">Update</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Bug Fix">Bug Fix</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pinned</label>
                    <select
                      value={form.pinned ? "yes" : "no"}
                      onChange={(e) => setForm({ ...form, pinned: e.target.value === "yes" })}
                      className="admin-input"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1" />
                  <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingAnnouncement ? "Update" : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          {loading ? (
            <div className="glass-card-static p-12 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card-static p-12 text-center text-gray-500">
              {search ? "No announcements match your search" : "No announcements yet"}
            </div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className={`glass-card-static p-5 ${a.pinned ? "purple-glow-border" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {a.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                          <Pin className="w-3 h-3" />
                          PINNED
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700/50 border border-gray-600/50 text-gray-400">
                        {a.category}
                      </span>
                      <h3 className="font-bold truncate">{a.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">{a.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>By {a.author}</span>
                      <span>·</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => togglePin(a)}
                      className={`p-1.5 rounded-lg transition-all ${
                        a.pinned
                          ? "bg-purple-glow/20 text-purple-neon"
                          : "hover:bg-purple-glow/10 text-gray-500"
                      }`}
                      title={a.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 rounded-lg hover:bg-purple-glow/20 text-purple-neon transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
