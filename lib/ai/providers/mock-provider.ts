import type { AIProvider } from "../interfaces/ai-provider";
import type { AICapability } from "../types/ai-capability";
import type { AIRequest } from "../types/ai-request";
import type { AIResponse } from "../types/ai-response";

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly name = "Mock Provider";
  readonly version = "1.0.0";

  async initialize(): Promise<void> {
    // No initialization required.
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getCapabilities(): Promise<AICapability[]> {
    return [
      "chat",
      "text-generation",
      "embeddings"
    ];
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    return {
      content: `Mock response: ${request.prompt}`,
      model: "mock-model",
      provider: this.id,
      finishReason: "stop",
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      }
    };
  }
}
