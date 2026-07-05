import type { Metadata } from "next";
import { FolderKanban, Search, Filter } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectsEmptyState } from "@/features/projects/components/projects-empty-state";
import { FileText, Image, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects | Everest AI Assistant",
  description: "Manage your Everest AI Assistant project workspaces.",
};

const allProjects = [
  {
    title: "Creator Launch Kit",
    description: "Campaign workspace for scripts, captions, short-form video prompts, and launch assets.",
    status: "Writing Studio",
    updatedAt: "Updated today",
    icon: FileText,
    category: "writing",
  },
  {
    title: "Research Brief",
    description: "Collected notes, source summaries, and outline drafts for a long-form educational piece.",
    status: "AI Chat",
    updatedAt: "Updated yesterday",
    icon: FileText,
    category: "chat",
  },
  {
    title: "Brand Image Set",
    description: "Visual direction, image prompts, and review notes for reusable publishing assets.",
    status: "Image Studio",
    updatedAt: "Updated 2 days ago",
    icon: Image,
    category: "images",
  },
  {
    title: "Product Explainer",
    description: "Storyboard, narration plan, and video generation steps for a concise explainer.",
    status: "Video Studio",
    updatedAt: "Updated 4 days ago",
    icon: Video,
    category: "video",
  },
  {
    title: "Voiceover Narration Prep",
    description: "Narration script cloning setups and voice pitch options for the final launch explainer.",
    status: "Voice Studio",
    updatedAt: "Updated 5 days ago",
    icon: FileText,
    category: "voice",
  },
  {
    title: "Weekly News Outline",
    description: "Weekly newsletter drafts compiled from curated research notes and AI chat sessions.",
    status: "Writing Studio",
    updatedAt: "Updated 1 week ago",
    icon: FileText,
    category: "writing",
  },
];

export default function ProjectsPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <FolderKanban className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Workspace Management</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage, organize, and transition your active creative workspaces across all Studio modules.
              </p>
            </div>
            <CreateProjectDialog triggerClassName="w-full sm:w-auto" />
          </div>
        </section>

        {/* Toolbar & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search projects..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1">
              <Filter className="size-3.5" /> Filter:
            </span>
            <button className="h-8 rounded-lg bg-secondary px-3 text-xs font-medium text-secondary-foreground">All</button>
            <button className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent/40">Writing</button>
            <button className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent/40">Chat</button>
            <button className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent/40">Voice</button>
            <button className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent/40">Images</button>
            <button className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent/40">Video</button>
          </div>
        </div>

        {/* Grid and Sidebar */}
        <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-4 md:grid-cols-2">
            {allProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>

          <aside className="space-y-4">
            <ProjectsEmptyState />
            <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
              <h3 className="text-sm font-semibold">Workspace Statistics</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Total Projects</dt>
                  <dd className="font-semibold">6 active</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Storage Connected</dt>
                  <dd className="text-destructive font-medium">Offline/Local</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Default Engine</dt>
                  <dd className="font-medium">Ollama + Mock</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
