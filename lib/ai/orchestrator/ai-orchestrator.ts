import { ProviderRegistry } from "../registry/provider-registry";
import { RuntimeManager } from "../runtime/runtime-manager";
import { RuntimeSelector } from "../runtime/runtime-selector";

import type { ProviderRequest } from "../providers/base/provider-request";
import type { ProviderResponse } from "../providers/base/provider-response";

export class AIOrchestrator {

  private readonly runtime = new RuntimeManager();

  private readonly registry = new ProviderRegistry();

  private readonly selector = new RuntimeSelector();

  constructor() {
    this.runtime.initialize();
  }

  async execute(
    request: ProviderRequest
  ): Promise<ProviderResponse> {

    const context = this.runtime
      .engine()
      .createContext({
        requiredCapabilities: ["chat"],
      });

    const provider = this.selector.select(
      context.strategy,
      this.registry.list()
    );

    return provider.generate(request);

  }

}
