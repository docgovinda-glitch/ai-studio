import type { AIProvider } from "../../providers/base/ai-provider";

export class FreeStrategy {

  select(
    providers: AIProvider[]
  ): AIProvider {

    return providers[0];

  }

}
