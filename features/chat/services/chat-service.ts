import { sendMessage } from "../api/chat-api";
import type { ChatRequest } from "../types/chat-request";

export class ChatService {

  async send(request: ChatRequest) {
    return sendMessage(request);
  }

}

export const chatService = new ChatService();
