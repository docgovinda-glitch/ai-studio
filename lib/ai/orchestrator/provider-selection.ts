/**
 * Represents the provider selected by the Routing Engine.
 */
export interface ProviderSelection {
  providerId: string;

  model?: string;

  score: number;

  reason: string;
}
