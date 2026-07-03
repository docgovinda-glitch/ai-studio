import type { AIProvider } from "../../providers/base/ai-provider";

export class CustomStrategy {

  select(
    providers: AIProvider[]
  ): AIProvider {

    return providers[0];

  }

}
