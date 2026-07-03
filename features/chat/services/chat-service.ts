import { sendMessage } from "../api/chat-api";

import type { ChatRequest } from "../types/chat-request";

export class ChatService {

  async send(
    request: ChatRequest
  ) {
    return sendMessage(request);
  }

  async stream(
    request: ChatRequest
  ): Promise<ReadableStream<Uint8Array>> {

    const response = await fetch(
      "/api/ai?stream=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Unable to start stream.");
    }

    return response.body;

  }

}

export const chatService =
  new ChatService();
