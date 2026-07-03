import type { ChatRequest } from "../types/chat-request";
import type { ChatResponse } from "../types/chat-response";

export async function sendMessage(
  request: ChatRequest
): Promise<ChatResponse> {

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type":"application/json"
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to contact AI Runtime.");
  }

  return response.json();

}
