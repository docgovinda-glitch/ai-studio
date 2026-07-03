import { ProviderRegistry } from "../registry/provider-registry";
import { RoutingEngine } from "../routing/routing-engine";
import type { ProviderRequest } from "../providers/base/provider-request";
import type { ProviderResponse } from "../providers/base/provider-response";

export class AIOrchestrator {

  private readonly registry: ProviderRegistry;

  private readonly router: RoutingEngine;

  constructor() {
    this.registry = new ProviderRegistry();
    this.router = new RoutingEngine(this.registry);
  }

  async execute(
    request: ProviderRequest
  ): Promise<ProviderResponse> {

    const provider = this.router.selectProvider();

    return provider.generate(request);

  }

}
