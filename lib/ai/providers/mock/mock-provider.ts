import type { AIProvider } from "../base/ai-provider";
import type { ProviderConfig } from "../base/provider-config";
import type { ProviderMetadata } from "../base/provider-metadata";
import type { ProviderRequest } from "../base/provider-request";
import type { ProviderResponse } from "../base/provider-response";

const encoder = new TextEncoder();

export class MockProvider implements AIProvider {

  readonly config: ProviderConfig = {
    id: "mock",
    name: "Mock",
    enabled: true,
    defaultModel: "mock-model",
    timeout: 1000,
  };

  readonly metadata: ProviderMetadata = {
    id: "mock",
    name: "Mock Provider",
    vendor: "AI Studio",
    version: "1.0",
    supportsChat: true,
    supportsVision: false,
    supportsStreaming: true,
    supportsToolCalling: false,
    supportsEmbeddings: false,
    supportsImageGeneration: false,
    supportsAudio: false,
    supportsVideo: false,
  };

  async generate(
    request: ProviderRequest
  ): Promise<ProviderResponse> {

    return {
      content: `Mock response: ${request.prompt}`,
      model: "mock-model",
      provider: "mock",
      finishReason: "stop",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
    };

  }

  async stream(
    request: ProviderRequest
  ): Promise<ReadableStream<Uint8Array>> {

    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`Mock response: ${request.prompt}`)
        );
        controller.close();
      },
    });

  }

  async health(): Promise<boolean> {
    return true;
  }

}
