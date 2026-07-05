"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  item: NavigationItem;
  variant: "sidebar" | "mobile";
};

export function NavigationLink({ item, variant }: NavigationLinkProps) {
  const pathname = usePathname();
  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        variant === "sidebar"
          ? "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
          : "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
        isActive
          ? variant === "sidebar"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "bg-accent text-accent-foreground"
          : variant === "sidebar"
            ? "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
