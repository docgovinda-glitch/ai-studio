"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { NavigationList } from "@/components/layout/navigation-list";

export function Sidebar() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    setClickCount((prev) => {
      if (prev + 1 >= 5) {
        router.push("/admin");
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <aside className="hidden min-h-svh w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div 
        onClick={handleLogoClick}
        className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5 cursor-pointer select-none"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Everest AI</p>
          <p className="truncate text-xs text-muted-foreground">
            Unified AI Assistant {clickCount > 0 && `(${clickCount})`}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Main">
        <NavigationList variant="sidebar" />
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg border border-sidebar-border bg-background/50 p-3">
          <p className="text-xs font-medium text-sidebar-foreground">
            Local & Cloud Engine
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Adaptive auto-routing, offline model execution, and collective intelligence logs.
          </p>
        </div>
      </div>
    </aside>
  );
}
