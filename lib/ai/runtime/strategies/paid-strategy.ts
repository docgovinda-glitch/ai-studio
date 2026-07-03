import type { AIProvider } from "../../providers/base/ai-provider";

export class PaidStrategy {

  select(
    providers: AIProvider[]
  ): AIProvider {

    return providers[0];

  }

}
