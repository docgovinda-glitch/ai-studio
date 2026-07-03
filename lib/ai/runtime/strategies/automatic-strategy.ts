import type { AIProvider } from "../../providers/base/ai-provider";

export class AutomaticStrategy {

  select(
    providers: AIProvider[]
  ): AIProvider {

    if (providers.length === 0) {
      throw new Error(
        "No providers available."
      );
    }

    return providers[0];

  }

}
