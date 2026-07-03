export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderRequest {
  prompt: string;

  systemPrompt?: string;

  messages?: ChatMessage[];

  model?: string;

  temperature?: number;

  maxTokens?: number;

  stream?: boolean;

  metadata?: Record<string, unknown>;
}
