"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  PenLine,
  AudioLines,
  Video,
  FolderKanban,
  Settings,
  ShieldCheck,
  Image as ImageIcon,
  BookText,
  type LucideIcon,
} from "lucide-react";
import { NavigationLink } from "@/components/layout/navigation-link";

type NavigationListProps = {
  variant: "sidebar" | "mobile";
};

export function NavigationList({ variant }: NavigationListProps) {
  const navigationItems: { title: string; href: string; icon: LucideIcon; isAdminOnly?: boolean }[] = [
    { title: "AI Chat", href: "/chat", icon: Bot },
    { title: "Journal Studio", href: "/journal-assistant", icon: BookText },
    { title: "Writing Studio", href: "/writing", icon: PenLine },
    { title: "Image Studio", href: "/images", icon: ImageIcon },
    { title: "Voice Studio", href: "/voice", icon: AudioLines },
    { title: "Video Studio", href: "/video", icon: Video },
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Settings", href: "/settings", icon: Settings },
    { title: "Admin", href: "/admin", icon: ShieldCheck, isAdminOnly: true },
  ];

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