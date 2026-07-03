import { ReactNode } from "react";
import { ChatSidebar } from "./sidebar/chat-sidebar";
import { ChatHeader } from "./header/chat-header";

type ChatLayoutProps = {
  children: ReactNode;
};

export function ChatLayout({
  children,
}: ChatLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-xl border bg-background">

      <ChatSidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <ChatHeader />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
