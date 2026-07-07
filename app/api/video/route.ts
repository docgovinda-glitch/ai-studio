import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiGenerateVideoRequest } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VideoRequestBody = {
  prompt?: unknown;
  model?: unknown;
  providerId?: unknown;
  apiKeys?: unknown;
  duration?: unknown;
  style?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VideoRequestBody;
    const prompt = parsePrompt(body.prompt);
    const model = parseOptionalModel(body.model);
    const providerId = parseOptionalProviderId(body.providerId);
    const apiKeys = parseOptionalApiKeys(body.apiKeys);
    const duration = parseOptionalDuration(body.duration);
    const style = parseOptionalStyle(body.style);

    const kernel = createAiKernel();

    const response = await kernel.generateVideo({
      providerId,
      model,
      prompt,
      duration,
      style,
      apiKeys,
    });

    return Response.json({
      video: {
        url: response.videoUrl,
      },
      provider: {
        id: response.providerId,
        model: response.model,
      },
      metadata: response.metadata,
    });
  } catch (error) {
    if (error instanceof AiKernelError) {
      const status = error.status === 404 ? 400 : error.status;
      return Response.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status }
      );
    }

    return Response.json(
      {
        error: {
          code: "AI_VIDEO_REQUEST_FAILED",
          message: "AI Studio could not complete the video request.",
        },
      },
      { status: 500 }
    );
  }
}

function parsePrompt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AiKernelError("A prompt is required for video generation.", {
      code: "INVALID_VIDEO_PROMPT",
      status: 400,
    });
  }

  if (value.length > 1000) {
    throw new AiKernelError("Prompt can be up to 1000 characters.", {
      code: "INVALID_VIDEO_PROMPT",
      status: 400,
    });
  }

  return value.trim();
}

function parseOptionalModel(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 100) {
    throw new AiKernelError("Model must be a string up to 100 characters.", {
      code: "INVALID_VIDEO_MODEL",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalProviderId(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 50) {
    throw new AiKernelError("Provider ID must be a string up to 50 characters.", {
      code: "INVALID_VIDEO_PROVIDER",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalDuration(value: unknown) {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || value < 1 || value > 60) {
    throw new AiKernelError("Duration must be a number between 1 and 60 seconds.", {
      code: "INVALID_VIDEO_DURATION",
      status: 400,
    });
  }

  return value;
}

function parseOptionalStyle(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 50) {
    throw new AiKernelError("Style must be a string up to 50 characters.", {
      code: "INVALID_VIDEO_STYLE",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalApiKeys(value: unknown): Record<string, string> | undefined {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new AiKernelError("API Keys must be an object of key-value pairs.", {
      code: "INVALID_API_KEYS",
      status: 400,
    });
  }

  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === "string") {
      result[key] = val.trim();
    }
  }

  return result;
}