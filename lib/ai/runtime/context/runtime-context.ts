import { ExecutionStrategy } from "../execution-strategy";

export interface RuntimeContext {

  strategy: ExecutionStrategy;

  workspaceId?: string;

  projectId?: string;

  userId?: string;

  requiredCapabilities: string[];

}
