import type { AIProvider } from "../../providers/base/ai-provider";

export class LocalStrategy {

  select(
    providers: AIProvider[]
  ): AIProvider {

    const local = providers.find(
      p => p.config.id.startsWith("local")
    );

    return local ?? providers[0];

  }

}
