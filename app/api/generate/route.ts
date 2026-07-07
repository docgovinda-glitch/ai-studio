import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateRequestBody = {
  provider?: string;
  apiKey?: string;
  model?: string;
  systemInstruction?: string;
  prompt?: string;
  temperature?: number;
  responseMimeType?: string;
  taskType?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { provider, apiKey, model, systemInstruction, prompt, temperature, responseMimeType, taskType } = body;

    if (!prompt) {
      return Response.json({ error: "Missing required parameter: prompt" }, { status: 400 });
    }

    // Build messages array for the kernel
    const messages: { role: AiRole; content: string }[] = [];
    
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    // Build apiKeys object
    const apiKeys: Record<string, string> = {};
    if (provider && apiKey) {
      apiKeys[provider] = apiKey;
    }

    const kernel = createAiKernel();

    const response = await kernel.generateText({
      providerId: provider,
      model,
      messages,
      apiKeys,
      temperature: temperature ?? 0.5,
    });

    return Response.json({
      text: response.content,
      provider: response.providerId,
      model: response.model,
      inputWords: response.usage?.promptTokens || 0,
      outputWords: response.usage?.completionTokens || 0,
      latencyMs: 0,
      fromFallback: false,
    });
  } catch (error: any) {
    console.error("Generate API error:", error);
    return Response.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}