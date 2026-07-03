import { ExecutionStrategy } from "./execution-strategy";
import type { RuntimeContext } from "./context/runtime-context";

export class RuntimeEngine {

  private strategy: ExecutionStrategy =
    ExecutionStrategy.AUTOMATIC;

  setStrategy(
    strategy: ExecutionStrategy
  ) {
    this.strategy = strategy;
  }

  getStrategy(): ExecutionStrategy {
    return this.strategy;
  }

  createContext(
    partial: Partial<RuntimeContext>
  ): RuntimeContext {

    return {
      strategy: this.strategy,
      workspaceId: partial.workspaceId,
      projectId: partial.projectId,
      userId: partial.userId,
      requiredCapabilities:
        partial.requiredCapabilities ?? [],
    };

  }

}
