import type { ExecutionContext } from "./execution-context";
import type { ProviderSelection } from "./provider-selection";

/**
 * Responsible for selecting the best provider
 * based on the execution context.
 */
export class RoutingEngine {
  selectProvider(
    context: ExecutionContext
  ): ProviderSelection {

    // Future implementation:
    // - Evaluate execution mode
    // - Check provider availability
    // - Verify authentication
    // - Match capabilities
    // - Check quotas
    // - Calculate provider scores
    // - Select the highest scoring provider

    return {
      providerId: "mock",
      model: "mock-model",
      score: 100,
      reason: "Default provider until routing engine is implemented.",
    };
  }
}
