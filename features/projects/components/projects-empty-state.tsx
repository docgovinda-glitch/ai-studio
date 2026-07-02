import { FolderPlus } from "lucide-react";

import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

export function ProjectsEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-card-foreground">
      <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <FolderPlus className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">No archived projects</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Completed or archived workspaces will appear here when project storage is
        connected.
      </p>
      <div className="mt-5 flex justify-center">
        <CreateProjectDialog triggerLabel="Create Project" />
      </div>
    </div>
  );
}
