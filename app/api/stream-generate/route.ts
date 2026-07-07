import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiRole } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StreamGenerateRequestBody = {
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
    const body = (await request.json()) as StreamGenerateRequestBody;
    const { provider, apiKey, model, systemInstruction, prompt, temperature } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    // Get streaming response
    const stream = await kernel.generateTextStream({
      providerId: provider,
      model,
      messages,
      apiKeys,
      temperature: temperature ?? 0.5,
    });

    // Transform the stream to SSE format
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
    });

    const readableStream = stream.pipeThrough(transformStream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Stream generate API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}