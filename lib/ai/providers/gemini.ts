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

export const GEMINI_FREE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const DEFAULT_MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 30_000;

export function createGeminiProvider(): AiProvider {
  const defaultModel = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  return {
    id: "gemini",
    name: "Google Gemini (Cloud)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.GEMINI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "Gemini API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      const model = request.model ?? defaultModel;

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      // Map roles: system instruction vs conversational history
      const systemMessage = request.messages.find((m) => m.role === "system");
      const chatMessages = request.messages.filter((m) => m.role !== "system");

      const contents = chatMessages.map((msg) => {
        const geminiRole = msg.role === "assistant" ? "model" : "user";
        return {
          role: geminiRole as "user" | "model",
          parts: [{ text: msg.content }],
        };
      });

      // Gemini requires that the request ends with a user role and is not empty.
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Hello" }],
        });
      } else if (contents[contents.length - 1].role !== "user") {
        contents.push({
          role: "user",
          parts: [{ text: "Continue" }],
        });
      }

      const bodyPayload: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      };

      if (systemMessage) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemMessage.content }],
        };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new AiProviderUnavailableError(
              "Gemini rate limit or quota exceeded (HTTP 429)."
            );
          }
          const errText = await response.text();
          throw new AiProviderRequestError(
            `Gemini returned HTTP ${response.status}: ${errText}`,
            response.status
          );
        }

        const payload = await response.json();
        const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof content !== "string") {
          throw new AiProviderRequestError("Gemini returned an empty or invalid content block.");
        }

        return {
          providerId: "gemini",
          model,
          content,
          usage: {
            promptTokens: payload.usageMetadata?.promptTokenCount,
            completionTokens: payload.usageMetadata?.candidatesTokenCount,
            totalTokens: payload.usageMetadata?.totalTokenCount,
          },
          metadata: {
            finishReason: payload.candidates?.[0]?.finishReason,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "Gemini request timed out before returning a response."
            );
          }
          if (error.message.includes("fetch failed")) {
            throw new AiProviderUnavailableError(
              "Could not reach Gemini. Check your internet connection."
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
      const apiKey = request.apiKey ?? process.env.GEMINI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "Gemini API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      const model = request.model ?? defaultModel;

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      // Map roles: system instruction vs conversational history
      const systemMessage = request.messages.find((m) => m.role === "system");
      const chatMessages = request.messages.filter((m) => m.role !== "system");

      const contents = chatMessages.map((msg) => {
        const geminiRole = msg.role === "assistant" ? "model" : "user";
        return {
          role: geminiRole as "user" | "model",
          parts: [{ text: msg.content }],
        };
      });

      // Gemini requires that the request ends with a user role and is not empty.
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Hello" }],
        });
      } else if (contents[contents.length - 1].role !== "user") {
        contents.push({
          role: "user",
          parts: [{ text: "Continue" }],
        });
      }

      const bodyPayload: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      };

      if (systemMessage) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemMessage.content }],
        };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey.trim()}&alt=sse`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 429) {
          throw new AiProviderUnavailableError(
            "Gemini rate limit or quota exceeded (HTTP 429)."
          );
        }
        const errText = await response.text();
        throw new AiProviderRequestError(
          `Gemini returned HTTP ${response.status}: ${errText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AiProviderRequestError(
          "Gemini API did not return a response body.",
          500
        );
      }

      // Create a transform stream to convert Gemini streaming format
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
                  // Gemini streaming format: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
                  const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
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