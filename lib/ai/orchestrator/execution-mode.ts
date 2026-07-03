/**
 * Defines how AI Studio should execute requests.
 */
export enum ExecutionMode {
  /**
   * AI Studio automatically selects the best provider.
   */
  AUTOMATIC = "automatic",

  /**
   * Prefer local providers first, then cloud providers if needed.
   */
  HYBRID = "hybrid",

  /**
   * Use only local providers.
   */
  LOCAL = "local",

  /**
   * Use only cloud providers.
   */
  CLOUD = "cloud",

  /**
   * Follow a user-defined routing policy.
   */
  CUSTOM = "custom",
}
