export type AiRole = "system" | "user" | "assistant";

export type AiTextMessage = {
  role: AiRole;
  content: string;
};

export type AiCapability = "chat";

export type AiProviderMetadata = {
  id: string;
  name: string;
  capabilities: AiCapability[];
  defaultModel?: string;
};

export type AiGenerateTextRequest = {
  messages: AiTextMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  apiKey?: string;
};

export type AiGenerateTextResponse = {
  providerId: string;
  model: string;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, string | number | boolean>;
};

export type AiProvider = AiProviderMetadata & {
  generateText(request: AiGenerateTextRequest): Promise<AiGenerateTextResponse>;
};

export type AiKernelGenerateTextRequest = AiGenerateTextRequest & {
  providerId?: string;
  apiKeys?: Record<string, string>;
};
