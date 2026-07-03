"use client";

import { useState } from "react";

import { chatService } from "../services/chat-service";

import type { ChatMessage } from "../types/chat-message";

export function useChat() {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(prompt: string) {

    if (!prompt.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: new Date(),
    };

    const assistantId = crypto.randomUUID();

    setMessages(previous => [
      ...previous,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      },
    ]);

    setLoading(true);
    setError(null);

    try {

      const stream = await chatService.stream({
        prompt,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {

        const { done, value } =
          await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {

          if (!line.trim()) continue;

          try {

            const json = JSON.parse(line);

            if (!json.response) continue;

            setMessages(previous =>
              previous.map(message =>
                message.id === assistantId
                  ? {
                      ...message,
                      content:
                        message.content +
                        json.response,
                    }
                  : message
              )
            );

          } catch {
            // Ignore partial JSON chunks
          }

        }

      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unknown error."
      );

    } finally {

      setLoading(false);

    }

  }

  return {
    messages,
    loading,
    error,
    send,
  };

}
