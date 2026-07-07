"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Activity,
  Settings,
  Cpu,
  Globe,
  Trash2,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
  role: "user" | "admin";
  preferredModel?: string;
  countryCode?: string;
  approved?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("current_user_role");
      if (role !== "admin") {
        router.replace("/settings");
        return;
      }
      setIsAdmin(true);

      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUserEmail(parsed.email || "");
        } catch {}
      }

      const raw = localStorage.getItem("everest_registered_users");
      if (raw) {
        try {
          setUsers(JSON.parse(raw));
        } catch {
          console.warn("Failed to parse registered users from localStorage.");
        }
      }
    }
  }, [router]);

  const handleDeleteUser = (email: string) => {
    const updated = users.filter((u) => u.email !== email);
    setUsers(updated);
    localStorage.setItem("everest_registered_users", JSON.stringify(updated));
  };

  const handleApproveUser = (email: string) => {
    const updated = users.map((u) => {
      if (u.email === email) {
        return { ...u, approved: true };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem("everest_registered_users", JSON.stringify(updated));
  };

  const handleToggleRole = (email: string) => {
    const updated = users.map((u) => {
      if (u.email === email) {
        const newRole = u.role === "admin" ? "user" : "admin";
        return { ...u, role: newRole as "user" | "admin" };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem("everest_registered_users", JSON.stringify(updated));

    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const newRole = parsed.role === "admin" ? "user" : "admin";
          localStorage.setItem("current_user", JSON.stringify({ ...parsed, role: newRole }));
          localStorage.setItem("current_user_role", newRole);
        } catch {}
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("current_user");
    localStorage.removeItem("current_user_role");
    router.push("/login");
  };

  if (!isAdmin) {
    return null;
  }

  const pendingUsers = users.filter((u) => u.role !== "admin" && u.approved === false);
  const activeUsers = users.filter((u) => u.role === "admin" || u.approved !== false);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const regularCount = activeUsers.length - adminCount;
  const pendingCount = pendingUsers.length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Deletion Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left">
              <h3 className="text-sm font-bold text-foreground">Confirm Action</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove the user <span className="font-semibold text-foreground">{userToDelete}</span>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setUserToDelete(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteUser(userToDelete);
                    setUserToDelete(null);
                  }}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage users, monitor system activity</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="size-4" />}
            label="Total Registered"
            value={totalUsers}
            sub="Registered accounts"
          />
          <StatCard
            icon={<ShieldCheck className="size-4" />}
            label="Admins"
            value={adminCount}
            sub="Administrative access"
          />
          <StatCard
            icon={<Users className="size-4" />}
            label="Active Users"
            value={regularCount}
            sub="Standard access"
          />
          <StatCard
            icon={<Activity className="size-4" />}
            label="Pending Approvals"
            value={pendingCount}
            sub="Awaiting review"
          />
        </div>

        {/* Pending Approvals Table */}
        {pendingCount > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/10">
              <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="size-4 animate-pulse" />
                Awaiting Onboarding Approval
              </h2>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {pendingCount} Action Needed
              </span>
            </div>
            <div className="divide-y divide-amber-500/10">
              {pendingUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between px-5 py-4 hover:bg-amber-500/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase animate-pulse">
                      {user.firstName?.[0] || "?"}{user.lastName?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email} • {user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveUser(user.email)}
                      className="text-xs h-8 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20 transition-all font-semibold"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserToDelete(user.email)}
                      className="text-xs h-8 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border-red-500/20 transition-all font-semibold"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Registered &amp; Approved Users
            </h2>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {activeUsers.length} active
            </span>
          </div>

          {activeUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No active users found.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {activeUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRole(user.email)}
                      disabled={user.email.toLowerCase() === currentUserEmail.toLowerCase()}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        user.email.toLowerCase() === currentUserEmail.toLowerCase()
                           ? "cursor-not-allowed opacity-80"
                           : "hover:bg-primary/5 hover:border-primary"
                       } ${
                        user.role === "admin"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}
                      title={user.email.toLowerCase() === currentUserEmail.toLowerCase() ? "Cannot change your own role" : `Toggle role to ${user.role === "admin" ? "user" : "admin"}`}
                    >
                      {user.role}
                    </button>
                    {user.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
                      <button
                        onClick={() => setUserToDelete(user.email)}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete user"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OAuth Configuration */}
        <OAuthConfigSection />

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-foreground">AI Chat</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-foreground">Projects</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function OAuthConfigSection() {
  const [googleId, setGoogleId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");
  const [facebookId, setFacebookId] = useState("");
  const [facebookSecret, setFacebookSecret] = useState("");
  const [githubId, setGithubId] = useState("");
  const [githubSecret, setGithubSecret] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGoogleId(localStorage.getItem("OAUTH_GOOGLE_CLIENT_ID") || "");
      setGoogleSecret(localStorage.getItem("OAUTH_GOOGLE_CLIENT_SECRET") || "");
      setFacebookId(localStorage.getItem("OAUTH_FACEBOOK_CLIENT_ID") || "");
      setFacebookSecret(localStorage.getItem("OAUTH_FACEBOOK_CLIENT_SECRET") || "");
      setGithubId(localStorage.getItem("OAUTH_GITHUB_CLIENT_ID") || "");
      setGithubSecret(localStorage.getItem("OAUTH_GITHUB_CLIENT_SECRET") || "");
    }
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/save-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId,
          googleSecret,
          facebookId,
          facebookSecret,
          githubId,
          githubSecret,
        }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save credentials to environment file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving configurations.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Settings className="size-4 text-primary" />
          OAuth API Configurations
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure Google, Facebook, and GitHub client credentials for client authentication.
        </p>
      </div>

      <div className="space-y-4">
        {/* Google */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b border-border/30 pb-1">
            Google OAuth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Client ID</label>
              <input
                type="text"
                value={googleId}
                onChange={(e) => setGoogleId(e.target.value)}
                placeholder="Google Client ID"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Client Secret</label>
              <input
                type="password"
                value={googleSecret}
                onChange={(e) => setGoogleSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Facebook */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b border-border/30 pb-1">
            Facebook OAuth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">App ID / Client ID</label>
              <input
                type="text"
                value={facebookId}
                onChange={(e) => setFacebookId(e.target.value)}
                placeholder="Facebook App ID"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">App Secret / Client Secret</label>
              <input
                type="password"
                value={facebookSecret}
                onChange={(e) => setFacebookSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* GitHub */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b border-border/30 pb-1">
            GitHub OAuth
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Client ID</label>
              <input
                type="text"
                value={githubId}
                onChange={(e) => setGithubId(e.target.value)}
                placeholder="GitHub Client ID"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Client Secret</label>
              <input
                type="password"
                value={githubSecret}
                onChange={(e) => setGithubSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/30 pt-4">
        <span className="text-[10px] text-muted-foreground">
          Note: Changes are saved instantly to the local environment configuration dashboard.
        </span>
        <Button onClick={handleSave} size="sm" className="font-semibold h-9">
          {saved ? "Saved Configuration!" : "Save Configurations"}
        </Button>
      </div>
    </div>
  );
}
