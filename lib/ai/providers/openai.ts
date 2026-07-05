import "server-only";

import {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiProvider,
} from "@/lib/ai/types";
import {
  AiProviderRequestError,
  AiProviderUnavailableError,
  AiValidationError,
} from "@/lib/ai/errors";

export const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-3.5-turbo",
];

const DEFAULT_MODEL = "gpt-4o-mini";
const BASE_URL = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 30_000;

export function createOpenAIProvider(): AiProvider {
  const defaultModel = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  return {
    id: "openai",
    name: "OpenAI (Cloud)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.OPENAI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenAI API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      const model = request.model ?? defaultModel;

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      try {
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const body = await response.text();
          let parsedError = body;
          try {
            const json = JSON.parse(body);
            parsedError = json.error?.message ?? body;
          } catch {}

          throw new AiProviderRequestError(
            `OpenAI Request failed: ${parsedError}`,
            response.status
          );
        }

        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;

        if (typeof content !== "string") {
          throw new AiProviderRequestError(
            "OpenAI API returned an invalid response structure.",
            500
          );
        }

        return {
          providerId: "openai",
          model,
          content,
          usage: {
            promptTokens: payload.usage?.prompt_tokens,
            completionTokens: payload.usage?.completion_tokens,
            totalTokens: payload.usage?.total_tokens,
          },
          metadata: {
            nativeModel: payload.model ?? model,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "OpenAI request timed out before returning a response."
            );
          }
          if ("code" in error && error.code === "ECONNREFUSED") {
            throw new AiProviderUnavailableError(
              "Failed to establish connection to OpenAI endpoints."
            );
          }
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
