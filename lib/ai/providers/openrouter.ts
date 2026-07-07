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

// A list of popular free models on OpenRouter
export const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

const DEFAULT_MODEL = "auto";
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 30_000;

export function createOpenRouterProvider(): AiProvider {
  const defaultModel = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  return {
    id: "openrouter",
    name: "OpenRouter (Cloud)",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const apiKey = request.apiKey ?? process.env.OPENROUTER_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenRouter API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      let requestedModel = request.model ?? defaultModel;
      if (
        requestedModel === "lynn/soliloquy-l2-13b:free" ||
        requestedModel === "intel/neural-chat-7b-v3-1:free" ||
        requestedModel === "huggingfaceh4/zephyr-7b-beta:free" ||
        requestedModel === "openchat/openchat-7b:free" ||
        requestedModel === "undi95/toppy-m-7b:free" ||
        requestedModel === "deepseek/deepseek-r1:free"
      ) {
        requestedModel = "auto";
      }

      let modelsToTry: string[] = [];

      if (requestedModel === "auto") {
        // Task-based model selection
        const fullPrompt = request.messages.map((m) => m.content).join(" ").toLowerCase();
        
        let primaryModel = "openrouter/free";
        if (
          fullPrompt.includes("function") ||
          fullPrompt.includes("const ") ||
          fullPrompt.includes("class ") ||
          fullPrompt.includes("import ") ||
          fullPrompt.includes("code") ||
          fullPrompt.includes("script") ||
          fullPrompt.includes("typescript") ||
          fullPrompt.includes("javascript") ||
          fullPrompt.includes("python") ||
          fullPrompt.includes("rust") ||
          fullPrompt.includes("programming")
        ) {
          primaryModel = "qwen/qwen-2.5-7b-instruct:free";
        } else if (
          fullPrompt.includes("calculate") ||
          fullPrompt.includes("solve") ||
          fullPrompt.includes("math") ||
          fullPrompt.includes("equation") ||
          fullPrompt.includes("logic") ||
          fullPrompt.includes("analyze")
        ) {
          primaryModel = "openrouter/free";
        } else if (
          fullPrompt.includes("story") ||
          fullPrompt.includes("poem") ||
          fullPrompt.includes("creative") ||
          fullPrompt.includes("roleplay") ||
          fullPrompt.includes("character")
        ) {
          primaryModel = "meta-llama/llama-3.1-8b-instruct:free";
        }

        // Put primary model first, followed by other free options
        modelsToTry = [primaryModel, ...OPENROUTER_FREE_MODELS.filter((m) => m !== primaryModel)];
      } else {
        modelsToTry = [requestedModel, ...OPENROUTER_FREE_MODELS.filter((m) => m !== requestedModel)];
      }

      let lastError: Error | null = null;

      for (const targetModel of modelsToTry) {
        const controller = new AbortController();
        // Optimize failover: use a shorter 8s timeout for individual free tier model rotation
        const timeout = setTimeout(() => controller.abort(), 8_000);

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
              "HTTP-Referer": "https://ai-studio.operating-system",
              "X-Title": "AI Studio OS",
            },
            body: JSON.stringify({
              model: targetModel,
              messages: request.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              temperature: request.temperature ?? 0.7,
              max_tokens: request.maxTokens,
              stream: false,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            if (response.status === 429) {
              throw new AiProviderUnavailableError(
                `OpenRouter model "${targetModel}" rate limit or quota exceeded (HTTP 429).`
              );
            }
            const errText = await response.text();
            throw new AiProviderRequestError(
              `OpenRouter returned HTTP ${response.status} for model "${targetModel}": ${errText}`,
              response.status
            );
          }

          const payload = await response.json();
          const content = payload.choices?.[0]?.message?.content;

          if (typeof content !== "string") {
            throw new AiProviderRequestError(`OpenRouter returned an empty or invalid message for model "${targetModel}".`);
          }

          return {
            providerId: "openrouter",
            model: targetModel,
            content,
            usage: {
              promptTokens: payload.usage?.prompt_tokens,
              completionTokens: payload.usage?.completion_tokens,
              totalTokens: payload.usage?.total_tokens,
            },
            metadata: {
              nativeModel: payload.model ?? targetModel,
              generationTimeMs: payload.native_generation_time_ms,
              autoselected: requestedModel === "auto",
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(
            `OpenRouter: Target model "${targetModel}" failed: ${lastError.message}. Rotating to next available free model...`
          );
        } finally {
          clearTimeout(timeout);
        }
      }

      throw lastError ?? new AiProviderRequestError("All OpenRouter free tier models failed to generate response.", 500);
    },

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
      const apiKey = request.apiKey ?? process.env.OPENROUTER_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenRouter API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      let requestedModel = request.model ?? defaultModel;
      if (
        requestedModel === "lynn/soliloquy-l2-13b:free" ||
        requestedModel === "intel/neural-chat-7b-v3-1:free" ||
        requestedModel === "huggingfaceh4/zephyr-7b-beta:free" ||
        requestedModel === "openchat/openchat-7b:free" ||
        requestedModel === "undi95/toppy-m-7b:free" ||
        requestedModel === "deepseek/deepseek-r1:free"
      ) {
        requestedModel = "auto";
      }

      // For streaming, we use the primary model directly
      const targetModel = requestedModel === "auto" ? "openrouter/free" : requestedModel;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);

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
          "HTTP-Referer": "https://ai-studio.operating-system",
          "X-Title": "AI Studio OS",
        },
        body: JSON.stringify({
          model: targetModel,
          messages: request.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
          `OpenRouter returned HTTP ${response.status} for model "${targetModel}": ${errText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AiProviderRequestError(
          "OpenRouter API did not return a response body.",
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