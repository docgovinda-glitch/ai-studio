"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Key, Phone, User, AlertCircle, Check, Search, Sparkles, Camera } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";

interface UserProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  address?: string;
  countryCode?: string;
  email: string;
  phone: string;
  photo: string;
  password?: string;
  role: "user" | "admin";
  preferredModel?: string;
  faceVerified?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [preferredModel, setPreferredModel] = useState("gpt-4o-mini");
  const [profilePhoto, setProfilePhoto] = useState("/api/placeholder/120/120");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("everest_registered_users");
      if (!existing) {
        const adminUser: UserProfile = {
          firstName: "System",
          middleName: undefined,
          lastName: "Admin",
          address: undefined,
          countryCode: "+1",
          email: "admin@everest.ai",
          phone: "+1 (555) 019-2831",
          photo: "",
          password: "admin",
          role: "admin",
          preferredModel: "google/gemma-2-9b-it:free",
        };
        localStorage.setItem("everest_registered_users", JSON.stringify([adminUser]));
      }
    }
  }, []);

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

    localStorage.setItem("is_authenticated", "true");
    localStorage.setItem("current_user", JSON.stringify(matched));
    localStorage.setItem("current_user_role", matched.role);

    setSuccess("Login successful!");
    setTimeout(() => {
      if (matched.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/ai-control");
      }
    }, 800);
  };

  const handleSocialLogin = (platform: "google" | "facebook" | "github") => {
    setError("");
    setSuccess(`Connecting to ${platform}...`);

    setTimeout(() => {
      const socialUser: UserProfile = {
        firstName: `${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        lastName: "User",
        email: `guest@${platform}.com`,
        phone: "+1 (555) 000-0000",
        photo: "",
        role: platform === "github" ? "admin" : "user",
        preferredModel: "gpt-4o-mini",
        countryCode: "+1",
      };

      const usersRaw = localStorage.getItem("everest_registered_users");
      const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
      if (!users.some((u) => u.email === socialUser.email)) {
        users.push(socialUser);
        localStorage.setItem("everest_registered_users", JSON.stringify(users));
      }

      localStorage.setItem("is_authenticated", "true");
      localStorage.setItem("current_user", JSON.stringify(socialUser));
      localStorage.setItem("current_user_role", socialUser.role);

      setSuccess("Authentication successful!");
      setTimeout(() => {
        if (socialUser.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/ai-control");
        }
      }, 800);
    }, 1200);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword.trim()) {
      setError("Please fill in all mandatory onboarding fields.");
      return;
    }

    const usersRaw = localStorage.getItem("everest_registered_users");
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase())) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser: UserProfile = {
      firstName,
      middleName,
      lastName,
      address,
      email: signupEmail,
      phone: signupPhone,
      photo: profilePhoto,
      faceVerified: true,
      password: signupPassword,
      role: "user",
      preferredModel,
      countryCode,
    };

    users.push(newUser);
    localStorage.setItem("everest_registered_users", JSON.stringify(users));

    localStorage.setItem("is_authenticated", "true");
    localStorage.setItem("current_user", JSON.stringify(newUser));
    localStorage.setItem("current_user_role", "user");

    setSuccess("Onboarding complete! Creating workspace...");
    setTimeout(() => {
      router.push("/ai-control");
    }, 1000);
  };

  return (
    <AuthCard title={activeTab === "login" ? "Sign In" : "Create Account"}>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center text-center gap-3 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="size-5 text-foreground animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">Everest AI Assistant</h1>
          <p className="text-xs text-muted-foreground mt-1">Unified Local &amp; Cloud AI Workspace</p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="relative group">
          <img
            src={profilePhoto}
            alt="Profile"
            className="size-20 rounded-full object-cover border-2 border-border shadow-md"
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer hover:scale-110 transition-transform"
          >
            <Camera className="size-3.5" />
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setProfilePhoto(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">Tap to upload photo</p>
      </div>

      <div className="grid grid-cols-2 bg-muted/60 p-1 rounded-lg border border-border/30 mb-6">
        <button
          onClick={() => { setActiveTab("login"); setError(""); }}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === "login" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setActiveTab("signup"); setError(""); }}
          className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === "signup" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create Account
        </button>
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

      {activeTab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <div className="grid gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
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
                  placeholder="Enter account password"
                  className="w-full h-10 pl-9 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 mt-2 font-semibold">
            Sign In to Everest
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <span className="relative px-3 text-[10px] bg-background text-muted-foreground uppercase font-bold tracking-wider">
              Or Continue With
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="flex h-9 items-center justify-center rounded-lg border border-border bg-background/50 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all gap-1.5 text-xs font-semibold"
            >
              <Search className="size-3.5 text-red-500" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="flex h-9 items-center justify-center rounded-lg border border-border bg-background/50 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all gap-1.5 text-xs font-semibold"
            >
              <AlertCircle className="size-3.5 text-blue-600" />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="flex h-9 items-center justify-center rounded-lg border border-border bg-background/50 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all gap-1.5 text-xs font-semibold"
            >
              <User className="size-3.5" />
              GitHub
            </button>
          </div>

          <div className="pt-2 text-center text-[10px] text-muted-foreground leading-normal">
            💡 <strong>Quick Testing:</strong> Sign in with email <code>admin@everest.ai</code> and password <code>admin</code> to unlock the administrator controls.
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase border-b border-border/40 pb-1 flex items-center gap-1.5">
              <User className="size-3.5" /> 1. Basic Account Info (Mandatory)
            </h3>

            <div className="grid gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alice"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mt-2">Middle Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="M."
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mt-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Vance"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="alice@everest.ai"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Country Code</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+1"
                    className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="(555) 019-9021"
                    className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Onboarding Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full h-9 pl-9 rounded-lg border border-border bg-background/50 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 mt-3 font-semibold">
            Complete Onboarding
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
