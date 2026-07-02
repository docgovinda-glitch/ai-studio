import type { AICapability } from "./ai-capability";

export interface AIRequest {
  capability: AICapability;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, unknown>;
}
