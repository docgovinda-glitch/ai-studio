import { AIOrchestrator } from "../orchestrator/ai-orchestrator";
import type { ProviderRequest } from "../providers/base/provider-request";

const orchestrator = new AIOrchestrator();

export async function generateAIResponse(
  request: ProviderRequest
) {
  return orchestrator.execute(request);
}
