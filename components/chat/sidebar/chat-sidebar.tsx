export function ChatSidebar() {

  return (

    <aside className="hidden w-72 border-r bg-muted/20 lg:flex lg:flex-col">

      <div className="border-b p-4">

        <button
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          + New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto p-4">

        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Conversations
        </p>

        <div className="mt-4 rounded-lg border p-3">

          <p className="font-medium">
            Welcome
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your conversations will appear here.
          </p>

        </div>

      </div>

    </aside>

  );

}
