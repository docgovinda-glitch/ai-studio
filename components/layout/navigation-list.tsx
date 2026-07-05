"use client";

import { useEffect, useState } from "react";
import { navigationItems } from "@/components/layout/navigation";
import { NavigationLink } from "@/components/layout/navigation-link";

type NavigationListProps = {
  variant: "sidebar" | "mobile";
};

export function NavigationList({ variant }: NavigationListProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setIsAdmin(user.role === "admin");
        } catch {}
      }
    }
  }, []);

  const filteredItems = navigationItems.filter(
    (item) => !item.isAdminOnly || isAdmin
  );

  return (
    <>
      {filteredItems.map((item) => (
        <NavigationLink key={item.title} item={item} variant={variant} />
      ))}
    </>
  );
}
