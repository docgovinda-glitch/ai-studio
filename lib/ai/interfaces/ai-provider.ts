import type { AICapability } from "../types/ai-capability";
import type { AIRequest } from "../types/ai-request";
import type { AIResponse } from "../types/ai-response";

/**
 * Every AI provider must implement this interface.
 */
export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  initialize(): Promise<void>;

  isAvailable(): Promise<boolean>;

  getCapabilities(): Promise<AICapability[]>;

  execute(request: AIRequest): Promise<AIResponse>;
}
