export function EmptyChat() {
  return (
    <div className="max-w-xl text-center">

      <h1 className="text-4xl font-bold">
        AI Studio
      </h1>

      <p className="mt-6 text-lg text-muted-foreground">
        Your unified AI workspace.
      </p>

      <div className="mt-10 grid gap-3">

        <div className="rounded-xl border p-4">
          💬 Chat with Local AI
        </div>

        <div className="rounded-xl border p-4">
          📄 Analyze Documents
        </div>

        <div className="rounded-xl border p-4">
          🧠 Research Assistant
        </div>

      </div>

    </div>
  );
}
