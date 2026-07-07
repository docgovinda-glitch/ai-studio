import "server-only";

import { AiProviderRequestError, AiValidationError } from "@/lib/ai/errors";
import {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiGenerateImageRequest,
  AiGenerateImageResponse,
  AiGenerateVoiceRequest,
  AiGenerateVoiceResponse,
  AiGenerateVideoRequest,
  AiGenerateVideoResponse,
  AiProvider,
  AiProviderMetadata,
} from "@/lib/ai/types";
import { createOllamaProvider } from "@/lib/ai/providers/ollama";
import { createOpenRouterProvider } from "@/lib/ai/providers/openrouter";
import { createGeminiProvider } from "@/lib/ai/providers/gemini";
import { createGroqProvider } from "@/lib/ai/providers/groq";
import { createOpenAIProvider } from "@/lib/ai/providers/openai";
import { createAnthropicProvider } from "@/lib/ai/providers/anthropic";
import { createMockProvider } from "@/lib/ai/providers/mock";
import { createTogetherProvider } from "@/lib/ai/providers/together";
import { createDeepSeekProvider } from "@/lib/ai/providers/deepseek";

export class AiKernel {
  private readonly providers: Map<string, AiProvider>;
  private readonly defaultProviderId: string;

  constructor(providers: AiProvider[], defaultProviderId: string) {
    if (providers.length === 0) {
      throw new AiValidationError("At least one AI provider is required.");
    }

    this.providers = new Map(providers.map((provider) => [provider.id, provider]));
    this.defaultProviderId = defaultProviderId;

    if (!this.providers.has(defaultProviderId)) {
      throw new AiValidationError(
        `Default AI provider "${defaultProviderId}" is not registered.`
      );
    }
  }

  listProviders(): AiProviderMetadata[] {
    return Array.from(this.providers.values()).map(
      ({ id, name, capabilities, defaultModel }) => ({
        id,
        name,
        capabilities,
        defaultModel,
      })
    );
  }

  async generateText(
    request: AiGenerateTextRequest & { providerId?: string; apiKeys?: Record<string, string> }
  ): Promise<AiGenerateTextResponse> {
    const providerId = request.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" is not registered.`,
        400
      );
    }

    if (!provider.capabilities.includes("chat")) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support chat.`,
        400
      );
    }

    const apiKey = request.apiKeys?.[providerId] || getEnvKey(providerId);
    const isKeyless = providerId === "ollama" || providerId === "mock";

    if (!isKeyless && (!apiKey || !apiKey.trim())) {
      throw new AiProviderRequestError(
        `API key for "${providerId}" is missing. Please configure it in Settings.`,
        400
      );
    }

    return provider.generateText({
      ...request,
      apiKey,
    });
  }

  async generateTextStream(
    request: AiGenerateTextRequest & { providerId?: string; apiKeys?: Record<string, string> }
  ): Promise<ReadableStream> {
    const providerId = request.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" is not registered.`,
        400
      );
    }

    if (!provider.capabilities.includes("chat")) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support chat.`,
        400
      );
    }

    if (!provider.generateTextStream) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support streaming.`,
        400
      );
    }

    const apiKey = request.apiKeys?.[providerId] || getEnvKey(providerId);
    const isKeyless = providerId === "ollama" || providerId === "mock";

    if (!isKeyless && (!apiKey || !apiKey.trim())) {
      throw new AiProviderRequestError(
        `API key for "${providerId}" is missing. Please configure it in Settings.`,
        400
      );
    }

    return provider.generateTextStream!({
      ...request,
      apiKey,
    });
  }

  async generateImage(
    request: AiGenerateImageRequest & { providerId?: string; apiKeys?: Record<string, string> }
  ): Promise<AiGenerateImageResponse> {
    const providerId = request.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" is not registered.`,
        400
      );
    }

    if (!provider.capabilities.includes("image")) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support image generation.`,
        400
      );
    }

    if (!provider.generateImage) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support image generation.`,
        400
      );
    }

    const apiKey = request.apiKeys?.[providerId] || getEnvKey(providerId);
    const isKeyless = providerId === "ollama" || providerId === "mock";

    if (!isKeyless && (!apiKey || !apiKey.trim())) {
      throw new AiProviderRequestError(
        `API key for "${providerId}" is missing. Please configure it in Settings.`,
        400
      );
    }

    return provider.generateImage({
      ...request,
      apiKey,
    });
  }

  async generateVoice(
    request: AiGenerateVoiceRequest & { providerId?: string; apiKeys?: Record<string, string> }
  ): Promise<AiGenerateVoiceResponse> {
    const providerId = request.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" is not registered.`,
        400
      );
    }

    if (!provider.capabilities.includes("voice")) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support voice generation.`,
        400
      );
    }

    if (!provider.generateVoice) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support voice generation.`,
        400
      );
    }

    const apiKey = request.apiKeys?.[providerId] || getEnvKey(providerId);
    const isKeyless = providerId === "ollama" || providerId === "mock";

    if (!isKeyless && (!apiKey || !apiKey.trim())) {
      throw new AiProviderRequestError(
        `API key for "${providerId}" is missing. Please configure it in Settings.`,
        400
      );
    }

    return provider.generateVoice({
      ...request,
      apiKey,
    });
  }

  async generateVideo(
    request: AiGenerateVideoRequest & { providerId?: string; apiKeys?: Record<string, string> }
  ): Promise<AiGenerateVideoResponse> {
    const providerId = request.providerId || this.defaultProviderId;
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" is not registered.`,
        400
      );
    }

    if (!provider.capabilities.includes("video")) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support video generation.`,
        400
      );
    }

    if (!provider.generateVideo) {
      throw new AiProviderRequestError(
        `AI provider "${providerId}" does not support video generation.`,
        400
      );
    }

    const apiKey = request.apiKeys?.[providerId] || getEnvKey(providerId);
    const isKeyless = providerId === "ollama" || providerId === "mock";

    if (!isKeyless && (!apiKey || !apiKey.trim())) {
      throw new AiProviderRequestError(
        `API key for "${providerId}" is missing. Please configure it in Settings.`,
        400
      );
    }

    return provider.generateVideo({
      ...request,
      apiKey,
    });
  }
}

function getEnvKey(providerId: string): string | undefined {
  switch (providerId) {
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "gemini":
      return process.env.GEMINI_API_KEY;
    case "groq":
      return process.env.GROQ_API_KEY;
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "together":
      return process.env.TOGETHER_API_KEY;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;
    default:
      return undefined;
  }
}

export function createAiKernel() {
  return new AiKernel([
    createMockProvider(),
    createOllamaProvider(),
    createOpenRouterProvider(),
    createGeminiProvider(),
    createGroqProvider(),
    createOpenAIProvider(),
    createAnthropicProvider(),
    createTogetherProvider(),
    createDeepSeekProvider()
  ], "mock");
}
