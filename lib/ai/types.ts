export type AiRole = "system" | "user" | "assistant";

export type AiTextMessage = {
  role: AiRole;
  content: string;
};

export type AiCapability = "chat" | "image" | "voice" | "video";

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

export type AiGenerateImageRequest = {
  prompt: string;
  model?: string;
  size?: string;
  style?: string;
  quality?: string;
  signal?: AbortSignal;
  apiKey?: string;
};

export type AiGenerateImageResponse = {
  providerId: string;
  model: string;
  imageUrl?: string;
  imageBase64?: string;
  metadata?: Record<string, string | number | boolean>;
};

// Voice types
export type AiGenerateVoiceRequest = {
  text: string;
  model?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  format?: string;
  signal?: AbortSignal;
  apiKey?: string;
};

export type AiGenerateVoiceResponse = {
  providerId: string;
  model: string;
  audioUrl?: string;
  audioBase64?: string;
  metadata?: Record<string, string | number | boolean>;
};

// Video types
export type AiGenerateVideoRequest = {
  prompt: string;
  model?: string;
  duration?: number;
  style?: string;
  signal?: AbortSignal;
  apiKey?: string;
};

export type AiGenerateVideoResponse = {
  providerId: string;
  model: string;
  videoUrl?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type AiProvider = AiProviderMetadata & {
  generateText(request: AiGenerateTextRequest): Promise<AiGenerateTextResponse>;
  generateTextStream?(request: AiGenerateTextRequest): Promise<ReadableStream>;
  generateImage?(request: AiGenerateImageRequest): Promise<AiGenerateImageResponse>;
  generateVoice?(request: AiGenerateVoiceRequest): Promise<AiGenerateVoiceResponse>;
  generateVideo?(request: AiGenerateVideoRequest): Promise<AiGenerateVideoResponse>;
};

export type AiKernelGenerateTextRequest = AiGenerateTextRequest & {
  providerId?: string;
  apiKeys?: Record<string, string>;
};

export type AiKernelGenerateVoiceRequest = AiGenerateVoiceRequest & {
  providerId?: string;
  apiKeys?: Record<string, string>;
};

export type AiKernelGenerateVideoRequest = AiGenerateVideoRequest & {
  providerId?: string;
  apiKeys?: Record<string, string>;
};