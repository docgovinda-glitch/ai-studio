import { ExecutionStrategy } from "./execution-strategy";
import { AutomaticStrategy } from "./strategies/automatic-strategy";
import { LocalStrategy } from "./strategies/local-strategy";
import { FreeStrategy } from "./strategies/free-strategy";
import { PaidStrategy } from "./strategies/paid-strategy";
import { CustomStrategy } from "./strategies/custom-strategy";
import type { AIProvider } from "../providers/base/ai-provider";

export class RuntimeSelector {

  private readonly automatic =
    new AutomaticStrategy();

  private readonly local =
    new LocalStrategy();

  private readonly free =
    new FreeStrategy();

  private readonly paid =
    new PaidStrategy();

  private readonly custom =
    new CustomStrategy();

  select(
    strategy: ExecutionStrategy,
    providers: AIProvider[]
  ): AIProvider {

    switch (strategy) {

      case ExecutionStrategy.LOCAL:
        return this.local.select(providers);

      case ExecutionStrategy.FREE:
        return this.free.select(providers);

      case ExecutionStrategy.PAID:
        return this.paid.select(providers);

      case ExecutionStrategy.CUSTOM:
        return this.custom.select(providers);

      case ExecutionStrategy.AUTOMATIC:
      default:
        return this.automatic.select(providers);

    }

  }

}
