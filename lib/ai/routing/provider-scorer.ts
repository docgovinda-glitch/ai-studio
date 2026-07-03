import type { AIProvider } from "../providers/base/ai-provider";

export class ProviderScorer {

  score(provider: AIProvider): number {

    let score = 0;

    if (provider.config.enabled) {
      score += 100;
    }

    if (provider.metadata.supportsChat) {
      score += 20;
    }

    if (provider.metadata.supportsStreaming) {
      score += 10;
    }

    if (provider.metadata.supportsVision) {
      score += 10;
    }

    return score;
  }

}
