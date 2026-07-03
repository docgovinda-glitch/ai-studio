"use client";

import type { ChatMessage } from "@/features/chat/types/chat-message";

type ChatWindowProps = {
  messages: ChatMessage[];
  loading?: boolean;
};

export function ChatWindow({
  messages,
  loading = false,
}: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold">
              AI Studio
            </h2>

            <p className="mt-4 text-muted-foreground">
              Start a conversation with your local AI.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[80%] rounded-2xl bg-black px-5 py-3 text-white"
                  : "mr-auto max-w-[80%] rounded-2xl border bg-muted px-5 py-3"
              }
            >
              {message.content}
            </div>
          ))}

          {loading && (
            <div className="mr-auto rounded-2xl border bg-muted px-5 py-3 text-muted-foreground">
              Thinking...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
