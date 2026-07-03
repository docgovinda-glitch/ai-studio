import { NextResponse } from "next/server";

import { ProviderRegistry } from "@/lib/ai/registry/provider-registry";
import { AIService } from "@/lib/ai/services/ai-service";
import { MockProvider } from "@/lib/ai/providers/mock-provider";

const registry = new ProviderRegistry();
registry.register(new MockProvider());

const aiService = new AIService(registry);

export async function POST(request: Request) {
  const body = await request.json();

  const response = await aiService.execute("mock", {
    capability: "chat",
    prompt: body.prompt,
  });

  return NextResponse.json(response);
}