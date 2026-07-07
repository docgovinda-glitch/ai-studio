import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiGenerateImageRequest } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImageRequestBody = {
  prompt?: unknown;
  model?: unknown;
  providerId?: unknown;
  apiKeys?: unknown;
  size?: unknown;
  quality?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImageRequestBody;
    const prompt = parsePrompt(body.prompt);
    const model = parseOptionalModel(body.model);
    const providerId = parseOptionalProviderId(body.providerId);
    const apiKeys = parseOptionalApiKeys(body.apiKeys);
    const size = parseOptionalSize(body.size);
    const quality = parseOptionalQuality(body.quality);
    const kernel = createAiKernel();

    const response = await kernel.generateImage({
      providerId,
      model,
      prompt,
      size,
      quality,
      apiKeys,
    });

    return Response.json({
      image: {
        url: response.imageUrl,
        base64: response.imageBase64,
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
          code: "AI_IMAGE_REQUEST_FAILED",
          message: "AI Studio could not complete the image request.",
        },
      },
      { status: 500 }
    );
  }
}

function parsePrompt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AiKernelError("A prompt is required for image generation.", {
      code: "INVALID_IMAGE_PROMPT",
      status: 400,
    });
  }

  if (value.length > 1000) {
    throw new AiKernelError("Prompt can be up to 1000 characters.", {
      code: "INVALID_IMAGE_PROMPT",
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
      code: "INVALID_IMAGE_MODEL",
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
      code: "INVALID_IMAGE_PROVIDER",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalSize(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AiKernelError("Size must be a string.", {
      code: "INVALID_IMAGE_SIZE",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalQuality(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AiKernelError("Quality must be a string.", {
      code: "INVALID_IMAGE_QUALITY",
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