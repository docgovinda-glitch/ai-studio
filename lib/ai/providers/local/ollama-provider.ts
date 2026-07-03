import type { AIProvider } from "../base/ai-provider";
import type { ProviderConfig } from "../base/provider-config";
import type { ProviderMetadata } from "../base/provider-metadata";
import type { ProviderRequest } from "../base/provider-request";
import type { ProviderResponse } from "../base/provider-response";

export class OllamaProvider implements AIProvider {

  readonly config: ProviderConfig = {
    id: "ollama",
    name: "Ollama",
    enabled: true,
    baseUrl: "http://localhost:11434",
    defaultModel: "phi3.5:latest",
    timeout: 120000,
  };

  readonly metadata: ProviderMetadata = {
    id: "ollama",
    name: "Ollama",
    vendor: "Ollama",
    version: "1.0",
    supportsChat: true,
    supportsVision: true,
    supportsStreaming: true,
    supportsToolCalling: true,
    supportsEmbeddings: true,
    supportsImageGeneration: false,
    supportsAudio: false,
    supportsVideo: false,
  };

  async generate(
    request: ProviderRequest
  ): Promise<ProviderResponse> {

    const response = await fetch(
      `${this.config.baseUrl}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model ?? this.config.defaultModel,
          prompt: request.prompt,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed.");
    }

    const json = await response.json();

    return {
      content: json.response,
      model: json.model,
      provider: "ollama",
      finishReason: json.done_reason ?? "stop",
      usage: {
        inputTokens: json.prompt_eval_count ?? 0,
        outputTokens: json.eval_count ?? 0,
        totalTokens:
          (json.prompt_eval_count ?? 0) +
          (json.eval_count ?? 0),
      },
    };
  }

  async stream(
    request: ProviderRequest
  ): Promise<ReadableStream<Uint8Array>> {

    const response = await fetch(
      `${this.config.baseUrl}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model ?? this.config.defaultModel,
          prompt: request.prompt,
          stream: true,
        }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Unable to create Ollama stream.");
    }

    return response.body;
  }

  async health(): Promise<boolean> {

    try {

      const response = await fetch(
        `${this.config.baseUrl}/api/tags`
      );

      return response.ok;

    } catch {

      return false;

    }

  }

}
