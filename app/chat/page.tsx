import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export const metadata: Metadata = {
  title: "AI Chat | Everest AI Assistant",
  description: "Chat with local models through the Everest AI Assistant Kernel.",
};

export default function ChatPage() {
  return (
    <AppShell>
      <ChatWorkspace />
    </AppShell>
  );
}
