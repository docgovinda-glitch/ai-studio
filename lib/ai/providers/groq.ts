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

export const GROQ_FREE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 30_000;

export function createGroqProvider(): AiProvider {
  const defaultModel = process.env.GROQ_MODEL ?? DEFAULT_MODEL;

  return {
    id: "groq",
    name: "Groq (Cloud)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.GROQ_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "Groq API key is missing. Set it in Settings to enable this cloud provider."
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

        if (!response.ok) {
          if (response.status === 429) {
            throw new AiProviderUnavailableError(
              "Groq rate limit or quota exceeded (HTTP 429)."
            );
          }
          const errText = await response.text();
          throw new AiProviderRequestError(
            `Groq returned HTTP ${response.status}: ${errText}`,
            response.status
          );
        }

        const payload = await response.json();
        const content = payload.choices?.[0]?.message?.content;

        if (typeof content !== "string") {
          throw new AiProviderRequestError("Groq returned an empty or invalid message.");
        }

        return {
          providerId: "groq",
          model,
          content,
          usage: {
            promptTokens: payload.usage?.prompt_tokens,
            completionTokens: payload.usage?.completion_tokens,
            totalTokens: payload.usage?.total_tokens,
          },
          metadata: {
            nativeModel: payload.model ?? model,
            xGroqId: response.headers.get("x-groq-id") || "",
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "Groq request timed out before returning a response."
            );
          }
          if (error.message.includes("fetch failed")) {
            throw new AiProviderUnavailableError(
              "Could not reach Groq. Check your internet connection."
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
      const apiKey = request.apiKey ?? process.env.GROQ_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "Groq API key is missing. Set it in Settings to enable this cloud provider."
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
        if (response.status === 429) {
          throw new AiProviderUnavailableError(
            "Groq rate limit or quota exceeded (HTTP 429)."
          );
        }
        const errText = await response.text();
        throw new AiProviderRequestError(
          `Groq returned HTTP ${response.status}: ${errText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AiProviderRequestError(
          "Groq API did not return a response body.",
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