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

    setMessages(previous => [...previous, userMessage]);

    setLoading(true);

    setError(null);

    try {

      const response = await chatService.send({
        prompt,
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.content,
        createdAt: new Date(),
      };

      setMessages(previous => [
        ...previous,
        assistantMessage,
      ]);

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
