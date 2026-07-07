import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiGenerateVoiceRequest } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VoiceRequestBody = {
  text?: unknown;
  model?: unknown;
  providerId?: unknown;
  apiKeys?: unknown;
  voice?: unknown;
  speed?: unknown;
  format?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VoiceRequestBody;
    const text = parseText(body.text);
    const model = parseOptionalModel(body.model);
    const providerId = parseOptionalProviderId(body.providerId);
    const apiKeys = parseOptionalApiKeys(body.apiKeys);
    const voice = parseOptionalVoice(body.voice);
    const speed = parseOptionalSpeed(body.speed);
    const format = parseOptionalFormat(body.format);

    const kernel = createAiKernel();

    const response = await kernel.generateVoice({
      providerId,
      model,
      text,
      voice,
      speed,
      format,
      apiKeys,
    });

    return Response.json({
      audio: {
        url: response.audioUrl,
        base64: response.audioBase64,
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
          code: "AI_VOICE_REQUEST_FAILED",
          message: "AI Studio could not complete the voice request.",
        },
      },
      { status: 500 }
    );
  }
}

function parseText(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AiKernelError("Text is required for voice generation.", {
      code: "INVALID_VOICE_TEXT",
      status: 400,
    });
  }

  if (value.length > 10000) {
    throw new AiKernelError("Text can be up to 10000 characters.", {
      code: "INVALID_VOICE_TEXT",
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
      code: "INVALID_VOICE_MODEL",
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
      code: "INVALID_VOICE_PROVIDER",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalVoice(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 50) {
    throw new AiKernelError("Voice must be a string up to 50 characters.", {
      code: "INVALID_VOICE_VOICE",
      status: 400,
    });
  }

  return value.trim() || undefined;
}

function parseOptionalSpeed(value: unknown) {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || value < 0.1 || value > 4.0) {
    throw new AiKernelError("Speed must be a number between 0.1 and 4.0.", {
      code: "INVALID_VOICE_SPEED",
      status: 400,
    });
  }

  return value;
}

function parseOptionalFormat(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 20) {
    throw new AiKernelError("Format must be a string up to 20 characters.", {
      code: "INVALID_VOICE_FORMAT",
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