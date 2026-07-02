import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type ProjectCardProps = {
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  icon: LucideIcon;
};

export function ProjectCard({
  title,
  description,
  status,
  updatedAt,
  icon: Icon,
}: ProjectCardProps) {
  return (
    <article className="group rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-accent/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{updatedAt}</p>
          </div>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden="true"
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 inline-flex rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
        {status}
      </div>
    </article>
  );
}
