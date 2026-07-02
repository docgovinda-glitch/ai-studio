import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CreateProjectDialogProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

export function CreateProjectDialog({
  triggerClassName,
  triggerLabel = "New Project",
}: CreateProjectDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClassName} size="sm">
          <Plus className="size-4" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Set up a workspace for scripts, research, generated media, and
            publishing tasks.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              Project name
            </label>
            <input
              id="project-name"
              name="project-name"
              type="text"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder="Creator launch campaign"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="project-type" className="text-sm font-medium">
              Primary workflow
            </label>
            <select
              id="project-type"
              name="project-type"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              defaultValue="writing"
            >
              <option value="writing">Writing Studio</option>
              <option value="chat">AI Chat</option>
              <option value="voice">Voice Studio</option>
              <option value="images">Image Studio</option>
              <option value="video">Video Studio</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="project-notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="project-notes"
              name="project-notes"
              className="min-h-24 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder="Briefly describe the outcome this project should produce."
            />
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button">Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
