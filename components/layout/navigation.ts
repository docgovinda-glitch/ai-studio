import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bot,
  FolderKanban,
  Image,
  LayoutDashboard,
  Settings,
  Video,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  isAdminOnly?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "AI Control",
    href: "/ai-control",
    icon: LayoutDashboard,
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: Bot,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Voice Studio",
    href: "/voice",
    icon: AudioLines,
  },
  {
    title: "Image Studio",
    href: "/images",
    icon: Image,
  },
  {
    title: "Video Studio",
    href: "/video",
    icon: Video,
  },
  {
    title: "Journal Studio",
    href: "/journal-assistant",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Admin Console",
    href: "/admin",
    icon: ShieldCheck,
    isAdminOnly: true,
  },
];

