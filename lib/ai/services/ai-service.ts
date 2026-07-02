import type { AIRequest } from "../types/ai-request";
import type { AIResponse } from "../types/ai-response";
import { ProviderRegistry } from "../registry/provider-registry";

export class AIService {
  constructor(
    private readonly registry: ProviderRegistry
  ) {}

  async execute(
    providerId: string,
    request: AIRequest
  ): Promise<AIResponse> {
    const provider = this.registry.get(providerId);

    if (!provider) {
      throw new Error(`Provider "${providerId}" not found.`);
    }

    return provider.execute(request);
  }
}
