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

export const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-opus-latest",
];

const DEFAULT_MODEL = "claude-3-5-sonnet-latest";
const BASE_URL = "https://api.anthropic.com/v1/messages";
const TIMEOUT_MS = 30_000;

export function createAnthropicProvider(): AiProvider {
  const defaultModel = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  return {
    id: "anthropic",
    name: "Anthropic (Cloud)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.ANTHROPIC_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "Anthropic API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      const model = request.model ?? defaultModel;

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      // Extract system prompts and sanitize messages for Anthropic
      let systemPrompt = "";
      const chatMessages: { role: "user" | "assistant"; content: string }[] = [];

      for (const m of request.messages) {
        if (m.role === "system") {
          systemPrompt = (systemPrompt ? systemPrompt + "\n" : "") + m.content;
        } else {
          chatMessages.push({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          });
        }
      }

      if (chatMessages.length === 0) {
        // If only a system prompt was sent, construct a dummy user message to satisfy the API
        chatMessages.push({ role: "user", content: "Hello" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      try {
        const bodyPayload: Record<string, unknown> = {
          model,
          max_tokens: 4096,
          messages: chatMessages,
        };

        if (systemPrompt) {
          bodyPayload.system = systemPrompt;
        }

        const response = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(bodyPayload),
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
            `Anthropic Request failed: ${parsedError}`,
            response.status
          );
        }

        const payload = await response.json();
        
        // Anthropic content blocks: check if it returns a text block
        const contentBlock = payload.content?.[0];
        const content = contentBlock?.type === "text" ? contentBlock.text : "";

        if (typeof content !== "string") {
          throw new AiProviderRequestError(
            "Anthropic API returned an invalid response structure.",
            500
          );
        }

        return {
          providerId: "anthropic",
          model,
          content,
          usage: {
            promptTokens: payload.usage?.input_tokens,
            completionTokens: payload.usage?.output_tokens,
            totalTokens: (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0),
          },
          metadata: {
            nativeModel: payload.model ?? model,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "Anthropic request timed out before returning a response."
            );
          }
          if ("code" in error && error.code === "ECONNREFUSED") {
            throw new AiProviderUnavailableError(
              "Failed to establish connection to Anthropic endpoints."
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
