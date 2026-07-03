import { ExecutionMode } from "./execution-mode";
import { ProviderCapability } from "./provider-capability";

/**
 * Describes how AI Studio should select providers for a profile.
 */
export interface ProviderProfile {
  id: string;

  name: string;

  description?: string;

  executionMode: ExecutionMode;

  requiredCapabilities: ProviderCapability[];

  preferredProviders: string[];

  allowFallback: boolean;

  maxEstimatedCost?: number;

  prioritizePrivacy: boolean;
}
