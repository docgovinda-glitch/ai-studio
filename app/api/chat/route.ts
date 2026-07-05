import { createAiKernel, AiKernelError } from "@/lib/ai";
import type { AiRole, AiTextMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 16_000;
const MAX_MESSAGES = 50;
const VALID_ROLES = new Set<AiRole>(["system", "user", "assistant"]);

type ChatRequestBody = {
  messages?: unknown;
  model?: unknown;
  providerId?: unknown;
  apiKeys?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = parseMessages(body.messages);
    const model = parseOptionalModel(body.model);
    const providerId = parseOptionalProviderId(body.providerId);
    const apiKeys = parseOptionalApiKeys(body.apiKeys);
    const kernel = createAiKernel();

    const response = await kernel.generateText({
      providerId,
      model,
      messages,
      apiKeys,
    });

    return Response.json({
      message: {
        role: "assistant",
        content: response.content,
      },
      provider: {
        id: response.providerId,
        model: response.model,
      },
      usage: response.usage,
      metadata: response.metadata,
    });
  } catch (error) {
    if (error instanceof AiKernelError) {
      return Response.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      );
    }

    return Response.json(
      {
        error: {
          code: "AI_CHAT_REQUEST_FAILED",
          message: "AI Studio could not complete the chat request.",
        },
      },
      { status: 500 }
    );
  }
}

function parseMessages(value: unknown): AiTextMessage[] {
  if (!Array.isArray(value)) {
    throw new AiKernelError("Messages must be an array.", {
      code: "INVALID_CHAT_MESSAGES",
      status: 400,
    });
  }

  if (value.length === 0) {
    throw new AiKernelError("At least one message is required.", {
      code: "INVALID_CHAT_MESSAGES",
      status: 400,
    });
  }

  if (value.length > MAX_MESSAGES) {
    throw new AiKernelError(`A chat request can include up to ${MAX_MESSAGES} messages.`, {
      code: "INVALID_CHAT_MESSAGES",
      status: 400,
    });
  }

  return value.map((item) => {
    if (!isRecord(item)) {
      throw new AiKernelError("Each message must be an object.", {
        code: "INVALID_CHAT_MESSAGES",
        status: 400,
      });
    }

    const role = item.role;
    const content = item.content;

    if (typeof role !== "string" || !VALID_ROLES.has(role as AiRole)) {
      throw new AiKernelError("Each message must include a valid role.", {
        code: "INVALID_CHAT_MESSAGES",
        status: 400,
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      throw new AiKernelError("Each message must include content.", {
        code: "INVALID_CHAT_MESSAGES",
        status: 400,
      });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new AiKernelError(
        `Message content can be up to ${MAX_MESSAGE_LENGTH} characters.`,
        {
          code: "INVALID_CHAT_MESSAGES",
          status: 400,
        }
      );
    }

    return {
      role: role as AiRole,
      content: content.trim(),
    };
  });
}

function parseOptionalModel(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 100) {
    throw new AiKernelError("Model must be a string up to 100 characters.", {
      code: "INVALID_CHAT_MODEL",
      status: 400,
    });
  }

  const model = value.trim();

  return model || undefined;
}

function parseOptionalProviderId(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || value.length > 50) {
    throw new AiKernelError("Provider ID must be a string up to 50 characters.", {
      code: "INVALID_CHAT_PROVIDER",
      status: 400,
    });
  }

  const provider = value.trim();

  return provider || undefined;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
