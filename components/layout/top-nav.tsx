"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Command, Search, Sparkles, User, LogOut, Settings, ShieldCheck } from "lucide-react";

import { NavigationList } from "@/components/layout/navigation-list";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

export function TopNav() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; fullName?: string; email: string; photo: string; role: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {}
      }
    }
  }, []);

  const handleLogoClick = () => {
    if (user?.role !== "admin") return;
    setClickCount((prev) => {
      if (prev + 1 >= 5) {
        router.push("/admin");
        return 0;
      }
      return prev + 1;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("current_user");
    localStorage.removeItem("current_user_role");
    router.replace("/login");
  };

  const getInitials = (u: typeof user) => {
    if (!u) return "AI";
    const name = u.fullName || `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    if (!name) return "AI";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user
    ? user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Guest Account"
    : "Guest Account";
  const hasPhoto = user?.photo && user.photo !== "/api/placeholder/120/120" && user.photo !== "";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile Header Logo & Secret Click Target */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 lg:hidden cursor-pointer select-none"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Everest AI</p>
            <p className="truncate text-xs text-muted-foreground">
              Unified AI Workspace {clickCount > 0 && `(Secret: ${clickCount})`}
            </p>
          </div>
        </div>

        {/* Desktop Search */}
        <div className="hidden min-w-0 flex-1 items-center lg:flex">
          <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground glass-focus">
            <Search className="size-4" aria-hidden="true" />
            <span className="truncate">Search projects, studios, and agents</span>
            <kbd className="ml-auto hidden items-center rounded border border-border bg-background px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground xl:inline-flex">
              <Command className="mr-1 size-3" aria-hidden="true" />K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 relative">
          <CreateProjectDialog triggerClassName="hidden sm:inline-flex" />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" aria-hidden="true" />
          </Button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-foreground border border-white/10 hover:bg-white/10 overflow-hidden cursor-pointer glass-focus"
            >
              {hasPhoto ? (
                <img src={user!.photo} alt="Avatar" className="size-full object-cover" />
              ) : (
                <span>{getInitials(user)}</span>
              )}
            </button>

            {showDropdown && (
              <>
                {/* Backdrop dismiss */}
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl p-1 shadow-lg z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 text-left">
                    <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email || "guest@everest.ai"}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => { setShowDropdown(false); router.push("/settings"); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-md transition-all text-left"
                    >
                      <Settings className="size-3.5" />
                      Profile Settings
                    </button>
                    
                    {user?.role === "admin" && (
                      <button
                        onClick={() => { setShowDropdown(false); router.push("/admin"); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-primary/10 rounded-md transition-all text-left font-semibold"
                      >
                        <ShieldCheck className="size-3.5" />
                        Admin Console
                      </button>
                    )}
                  </div>
                  
                  <div className="border-t border-white/10 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-all text-left"
                    >
                      <LogOut className="size-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden"
        aria-label="Mobile main"
      >
        <NavigationList variant="mobile" />
      </nav>
    </header>
  );
}
