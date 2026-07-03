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

  private resolveProvider() {

    const context = this.runtime
      .engine()
      .createContext({
        requiredCapabilities: ["chat"],
      });

    return this.selector.select(
      context.strategy,
      this.registry.list()
    );

  }

  async execute(
    request: ProviderRequest
  ): Promise<ProviderResponse> {

    const provider = this.resolveProvider();

    return provider.generate(request);

  }

  async stream(
    request: ProviderRequest
  ): Promise<ReadableStream<Uint8Array>> {

    const provider = this.resolveProvider();

    return provider.stream(request);

  }

}
