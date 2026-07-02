import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    provider: "mock",
    prompt: body.prompt,
    response: `Mock response: ${body.prompt}`,
  });
}
