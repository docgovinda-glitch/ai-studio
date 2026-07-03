"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatWindow } from "@/components/chat/messages/chat-window";
import { ChatInput } from "@/components/chat/input/chat-input";

import { useChat } from "@/features/chat/hooks/use-chat";

export default function ChatPage() {
  const {
    messages,
    loading,
    error,
    send,
  } = useChat();

  return (
    <AppShell>
      <ChatLayout>
        <div className="flex h-full flex-col">

          <ChatWindow
            messages={messages}
            loading={loading}
          />

          {error && (
            <div className="border-t bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <ChatInput
            loading={loading}
            onSend={send}
          />

        </div>
      </ChatLayout>
    </AppShell>
  );
}
