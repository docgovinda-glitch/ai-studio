import type { ChatMessage } from "../types/chat-message";

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

class ChatStore {

  private state: ChatState = {
    messages: [],
    loading: false,
    error: null,
  };

  getState(): ChatState {
    return this.state;
  }

  addMessage(message: ChatMessage) {
    this.state.messages = [
      ...this.state.messages,
      message,
    ];
  }

  setLoading(loading: boolean) {
    this.state.loading = loading;
  }

  setError(error: string | null) {
    this.state.error = error;
  }

  clear() {
    this.state = {
      messages: [],
      loading: false,
      error: null,
    };
  }

}

export const chatStore = new ChatStore();
