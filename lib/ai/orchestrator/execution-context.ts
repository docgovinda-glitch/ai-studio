import { ExecutionMode } from "./execution-mode";
import { ProviderCapability } from "./provider-capability";
import type { ProviderProfile } from "./provider-profile";

/**
 * Runtime information used by the AI Orchestrator.
 */
export interface ExecutionContext {
  profile: ProviderProfile;

  executionMode: ExecutionMode;

  requiredCapabilities: ProviderCapability[];

  prompt: string;

  userId?: string;

  projectId?: string;

  conversationId?: string;

  preferredModel?: string;
}
