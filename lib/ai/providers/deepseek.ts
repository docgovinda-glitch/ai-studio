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

export const DEEPSEEK_MODELS = [
  "deepseek-chat",
  "deepseek-coder",
  "deepseek-reasoner",
];

const DEFAULT_MODEL = "deepseek-chat";
const BASE_URL = "https://api.deepseek.com/v1/chat/completions";
const TIMEOUT_MS = 30_000;

export function createDeepSeekProvider(): AiProvider {
  const defaultModel = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;

  return {
    id: "deepseek",
    name: "DeepSeek (Free/Paid)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.DEEPSEEK_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "DeepSeek API key is missing. Get a free key at https://deepseek.com"
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
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          throw new AiProviderRequestError(
            `DeepSeek returned HTTP ${response.status}: ${errText}`,
            response.status
          );
        }

        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;

        if (typeof content !== "string") {
          throw new AiProviderRequestError("DeepSeek returned an empty or invalid message.");
        }

        return {
          providerId: "deepseek",
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
              "DeepSeek request timed out before returning a response."
            );
          }
          if (error.message.includes("fetch failed")) {
            throw new AiProviderUnavailableError(
              "Could not reach DeepSeek. Check your internet connection."
            );
          }
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
      const apiKey = request.apiKey ?? process.env.DEEPSEEK_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "DeepSeek API key is missing. Get a free key at https://deepseek.com"
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

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        throw new AiProviderRequestError(
          `DeepSeek returned HTTP ${response.status}: ${errText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AiProviderRequestError(
          "DeepSeek API did not return a response body.",
          500
        );
      }

      // Create a transform stream to convert OpenAI-compatible streaming format
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          try {
            const text = new TextDecoder().decode(chunk);
            const lines = text.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.terminate();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch {
                  controller.enqueue(chunk);
                }
              }
            }
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return response.body.pipeThrough(transformStream);
    },
  };
}