export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAdminToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

export function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}
