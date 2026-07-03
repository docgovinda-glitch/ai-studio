"use client";

import { useState, KeyboardEvent } from "react";

type ChatInputProps = {
  onSend: (message: string) => Promise<void> | void;
  loading?: boolean;
};

export function ChatInput({
  onSend,
  loading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  async function submit() {
    const value = message.trim();

    if (!value || loading) return;

    setMessage("");

    await onSend(value);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-3">
        <textarea
          rows={2}
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Studio..."
          className="min-h-[56px] flex-1 resize-none rounded-xl border p-3 outline-none focus:ring-2"
        />

        <button
          onClick={submit}
          disabled={loading || !message.trim()}
          className="rounded-xl bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
