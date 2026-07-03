import type { AIProvider } from "../providers/base/ai-provider";
import { MockProvider } from "../providers/mock/mock-provider";
import { OllamaProvider } from "../providers/local/ollama-provider";

export class ProviderRegistry {

  private readonly providers = new Map<string, AIProvider>();

  constructor() {

    /*
     * Registration order matters.
     *
     * The RuntimeSelector currently picks the
     * first provider returned by the registry.
     *
     * Ollama becomes the default provider.
     */

    this.register(new OllamaProvider());

    this.register(new MockProvider());

  }

  register(provider: AIProvider): void {

    this.providers.set(
      provider.config.id,
      provider
    );

  }

  get(id: string): AIProvider {

    const provider =
      this.providers.get(id);

    if (!provider) {
      throw new Error(
        `Provider '${id}' not found.`
      );
    }

    return provider;

  }

  list(): AIProvider[] {

    return [...this.providers.values()];

  }

  exists(id: string): boolean {

    return this.providers.has(id);

  }

}
