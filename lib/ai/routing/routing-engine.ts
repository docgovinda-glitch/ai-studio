import { ProviderRegistry } from "../registry/provider-registry";
import { ProviderScorer } from "./provider-scorer";
import type { AIProvider } from "../providers/base/ai-provider";

export class RoutingEngine {

  constructor(
    private readonly registry: ProviderRegistry,
    private readonly scorer = new ProviderScorer()
  ) {}

  selectProvider(): AIProvider {

    const providers = this.registry.list();

    if (providers.length === 0) {
      throw new Error("No providers registered.");
    }

    const ranked = providers
      .map(provider => ({
        provider,
        score: this.scorer.score(provider),
      }))
      .sort((a, b) => b.score - a.score);

    return ranked[0].provider;
  }

}
