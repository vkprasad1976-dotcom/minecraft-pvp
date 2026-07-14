"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Save, Key, User } from "lucide-react";
import { authHeaders } from "@/lib/client-auth";

export default function AdminSettingsPage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.username) setUsername(data.username);
      });
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold purple-neon-text">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your admin account</p>
        </div>

        <div className="space-y-6">
          <div className="glass-card-static p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-neon" />
              <h2 className="font-bold">Account Info</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10">
                <span className="text-sm text-gray-500">Username:</span>
                <span className="font-medium">{username}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-purple-glow/10">
                <span className="text-sm text-gray-500">Role:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-glow/20 border border-purple-glow/40 text-purple-neon">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card-static p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-purple-neon" />
              <h2 className="font-bold">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-input"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Update Password"}
              </button>
            </form>
          </div>

          <div className="glass-card-static p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h2 className="font-bold mb-3">Security Tips</h2>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-neon mt-0.5">•</span>
                Change the default password (admin123) immediately
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-neon mt-0.5">•</span>
                Use a strong, unique password with 12+ characters
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-neon mt-0.5">•</span>
                Set JWT_SECRET environment variable in production
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-neon mt-0.5">•</span>
                Sessions expire after 24 hours automatically
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
