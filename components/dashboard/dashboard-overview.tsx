"use client";

import {
  AudioLines,
  Bot,
  Clapperboard,
  FileText,
  FolderKanban,
  Image,
  BookOpen,
  PenLine,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RecentProjects } from "@/features/projects/components/recent-projects";

const workflowCards = [
  {
    title: "AI Chat",
    description:
      "Start conversations, compare providers, and turn answers into reusable project assets.",
    icon: Bot,
    href: "/chat",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    title: "Journal Studio",
    description:
      "Conduct in-depth academic research, draft structured journals, and manage papers powered by the Doctoral Research Assistant.",
    icon: BookOpen,
    href: "/journal-assistant",
    color: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    title: "Writing Studio",
    description:
      "Draft, edit, and refine long-form content with AI assistance.",
    icon: PenLine,
    href: "/writing",
    color: "from-purple-500/10 to-purple-600/5",
  },
  {
    title: "Image Studio",
    description:
      "Create, review, and manage image-generation workflows from the same workspace.",
    icon: Image,
    href: "/images",
    color: "from-pink-500/10 to-pink-600/5",
  },
  {
    title: "Voice Studio",
    description:
      "Prepare narration, voice workflows, and audio production tasks.",
    icon: AudioLines,
    href: "/voice",
    color: "from-orange-500/10 to-orange-600/5",
  },
  {
    title: "Video Studio",
    description:
      "Coordinate video generation, editing steps, and production-ready creative pipelines.",
    icon: Clapperboard,
    href: "/video",
    color: "from-red-500/10 to-red-600/5",
  },
];

const principles = [
  "Human-controlled decisions",
  "Modular creation tools",
  "Local and cloud AI support",
  "Extensible agent workflows",
];

export function DashboardOverview() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Your unified AI creation workspace
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-base text-muted-foreground">
            Build, manage, and publish AI-assisted work from one studio. Chat with
            multiple providers, generate images and voice, draft academic papers,
            and organize everything into projects.
          </p>
          <div className="flex gap-3 pt-2">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => router.push("/chat")}
            >
              Start Chatting
              <ArrowRight className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push("/journal-assistant")}
            >
              Journal Studio
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">9</p>
              <p className="text-xs text-muted-foreground">AI Providers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-xs text-muted-foreground">Creative Studios</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Free Providers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <RecentProjects />

      {/* Studios Grid */}
      <section>
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Creative Studios</h2>
          <p className="text-sm text-muted-foreground">
            Core modules are organized as independent product areas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflowCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                onClick={() => router.push(card.href)}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                  style={{ 
                    background: `linear-gradient(135deg, hsl(var(--${card.color.split('-')[1]}-500)/0.1), hsl(var(--${card.color.split('-')[1]}-600)/0.05))` 
                  }} 
                />
                <div className="relative flex items-start gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Platform Principles */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Platform Principles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <div
              key={principle}
              className="flex items-center gap-2.5 text-sm"
            >
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">{principle}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}