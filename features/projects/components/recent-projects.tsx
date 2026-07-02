import { FileText, Image, Video } from "lucide-react";

import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectsEmptyState } from "@/features/projects/components/projects-empty-state";

const recentProjects = [
  {
    title: "Creator Launch Kit",
    description:
      "Campaign workspace for scripts, captions, short-form video prompts, and launch assets.",
    status: "Writing Studio",
    updatedAt: "Updated today",
    icon: FileText,
  },
  {
    title: "Research Brief",
    description:
      "Collected notes, source summaries, and outline drafts for a long-form educational piece.",
    status: "AI Chat",
    updatedAt: "Updated yesterday",
    icon: FileText,
  },
  {
    title: "Brand Image Set",
    description:
      "Visual direction, image prompts, and review notes for reusable publishing assets.",
    status: "Image Studio",
    updatedAt: "Updated 2 days ago",
    icon: Image,
  },
  {
    title: "Product Explainer",
    description:
      "Storyboard, narration plan, and video generation steps for a concise explainer.",
    status: "Video Studio",
    updatedAt: "Updated 4 days ago",
    icon: Video,
  },
];

export function RecentProjects() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Recent Projects
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue active workspaces across writing, media, and research.
            </p>
          </div>
          <CreateProjectDialog triggerClassName="w-full sm:w-auto" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recentProjects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>

      <ProjectsEmptyState />
    </section>
  );
}
