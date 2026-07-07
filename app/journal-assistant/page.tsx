import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Journal Assistant | Everest AI Assistant",
  description: "Run the journal assistant experience inside AI Studio.",
};

export default function JournalAssistantPage() {
  // Best-effort: embed the Vite app served from journal-assistant.
  // If your deployment differs, update the iframe src.
  const iframeSrc =
    process.env.NEXT_PUBLIC_JOURNAL_ASSISTANT_URL ?? "http://localhost:5173";

  return (
    <AppShell>
      <div className="w-full">
        <div className="mb-4 rounded-xl border border-border/60 bg-background/60 p-4">
          <h1 className="text-lg font-semibold">Journal Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Research, draft, and refine using the journal assistant experience.
          </p>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/50 px-2 py-0.5">
              Embedded UI
            </span>
            <span className="truncate">{iframeSrc}</span>
          </div>
        </div>

        <div className="relative rounded-xl border border-border/60 bg-background/60 overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background/90 to-transparent pointer-events-none" />
          <iframe
            title="Journal Assistant"
            src={iframeSrc}
            className="w-full h-[calc(100vh-16.5rem)] sm:h-[calc(100vh-12.5rem)]"
            style={{ border: 0 }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: If the embedded app doesn’t load, set <span className="font-mono">NEXT_PUBLIC_JOURNAL_ASSISTANT_URL</span>.
        </p>
      </div>
    </AppShell>
  );
}

