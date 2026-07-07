import {
  AudioLines,
  Bot,
  Clapperboard,
  FileText,
  FolderKanban,
  Image,
  BookOpen,
  Rocket,
} from "lucide-react";

import { RecentProjects } from "@/features/projects/components/recent-projects";

const workflowCards = [
  {
    title: "AI Chat",
    description:
      "Start conversations, compare providers, and turn answers into reusable project assets.",
    icon: Bot,
  },
  {
    title: "Projects",
    description:
      "Organize research, generated media, scripts, and publishing work in one place.",
    icon: FolderKanban,
  },
  {
    title: "Journal Studio",
    description:
      "Conduct in-depth academic research, draft structured journals, and manage papers powered by the Doctoral Research Assistant.",
    icon: BookOpen,
  },
  {
    title: "Voice Studio",
    description:
      "Prepare narration, voice workflows, and audio production tasks for future provider support.",
    icon: AudioLines,
  },
  {
    title: "Image Studio",
    description:
      "Create, review, and manage image-generation workflows from the same workspace.",
    icon: Image,
  },
  {
    title: "Video Studio",
    description:
      "Coordinate video generation, editing steps, and production-ready creative pipelines.",
    icon: Clapperboard,
  },
];

const principles = [
  "Human-controlled decisions",
  "Modular creation tools",
  "Local and cloud AI support",
  "Extensible agent workflows",
];

export function DashboardOverview() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-start gap-4">
            <div className="hidden size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
              <Rocket className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                AI creation workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Build, manage, and publish AI-assisted work from one studio.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                AI Studio brings chat, writing, media generation, project
                management, and workflow automation into a single professional
                application shell.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <FileText className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Platform Principles</h2>
              <p className="text-xs text-muted-foreground">Version 1 shell</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RecentProjects />

      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Studios</h2>
          <p className="text-sm text-muted-foreground">
            Core modules are organized as independent product areas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflowCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
