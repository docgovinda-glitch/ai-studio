import Link from "next/link";
import { Bell, Command, Search, Sparkles } from "lucide-react";

import { navigationItems } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Studio</p>
            <p className="truncate text-xs text-muted-foreground">
              Unified AI workspace
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center lg:flex">
          <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
            <Search className="size-4" aria-hidden="true" />
            <span className="truncate">Search projects, studios, and agents</span>
            <kbd className="ml-auto hidden items-center rounded border border-border bg-background px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground xl:inline-flex">
              <Command className="mr-1 size-3" aria-hidden="true" />K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CreateProjectDialog triggerClassName="hidden sm:inline-flex" />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground">
            AI
          </div>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden"
        aria-label="Mobile main"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/";

          return (
            <Link
              key={item.title}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex h-9 shrink-0 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground"
                  : "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
