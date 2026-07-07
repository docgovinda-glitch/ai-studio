"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Key, AlertCircle, Check, Sparkles } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";

interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
  password?: string;
  role: "user" | "admin";
  preferredModel?: string;
  countryCode?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please fill in all credentials.");
      return;
    }
    const usersRaw = localStorage.getItem("everest_registered_users");
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    const matched = users.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );
    if (!matched) {
      setError("Invalid email or password.");
      return;
    }
    if (matched.role !== "admin") {
      setError("Admin credentials required.");
      return;
    }
    localStorage.setItem("is_authenticated", "true");
    localStorage.setItem("current_user", JSON.stringify(matched));
    localStorage.setItem("current_user_role", matched.role);
    setSuccess("Login successful!");
    setTimeout(() => router.push("/admin"), 800);
  };

  return (
    <AuthCard title="Admin Sign In">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-center text-center gap-3 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="size-5 text-foreground animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">Secure admin access</p>
        </div>
      </div>
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mb-4 animate-in fade-in duration-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-xs mb-4 animate-in fade-in duration-200">
          <Check className="size-4 shrink-0 mt-0.5 text-green-400 animate-bounce" />
          <span>{success}</span>
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="grid gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@everest.ai"
              className="w-full h-10 pl-9 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Password</label>
          <div className="relative">
            <Key className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-10 pl-9 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-10 mt-2 font-semibold">Sign In as Admin</Button>
      </form>
    </AuthCard>
  );
}
