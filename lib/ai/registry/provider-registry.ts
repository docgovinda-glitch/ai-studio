import type { AIProvider } from "../interfaces/ai-provider";

export class ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  getAll(): AIProvider[] {
    return [...this.providers.values()];
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }
}
