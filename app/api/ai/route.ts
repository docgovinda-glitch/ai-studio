import { NextResponse } from "next/server";

import { generateAIResponse } from "@/lib/ai/services/ai-service";

export async function POST(request: Request) {

  const body = await request.json();

  const response = await generateAIResponse({
    prompt: body.prompt,
  });

  return NextResponse.json(response);

}
