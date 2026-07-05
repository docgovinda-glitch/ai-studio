"use client";

import { navigationItems } from "@/components/layout/navigation";
import { NavigationLink } from "@/components/layout/navigation-link";

type NavigationListProps = {
  variant: "sidebar" | "mobile";
};

export function NavigationList({ variant }: NavigationListProps) {
  return (
    <>
      {navigationItems.map((item) => (
        <NavigationLink key={item.title} item={item} variant={variant} />
      ))}
    </>
  );
}
