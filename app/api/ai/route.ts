import { NextRequest } from "next/server";

import {
  generateAIResponse,
  streamAIResponse,
} from "@/lib/ai/services/ai-service";

export async function POST(
  request: NextRequest
) {

  const body = await request.json();

  const stream =
    request.nextUrl.searchParams.get("stream") === "true";

  if (stream) {

    const readable =
      await streamAIResponse({
        prompt: body.prompt,
        model: body.model,
      });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  }

  const response =
    await generateAIResponse({
      prompt: body.prompt,
      model: body.model,
    });

  return Response.json(response);

}
