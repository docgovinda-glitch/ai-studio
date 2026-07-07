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


const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.1";
const DEFAULT_TIMEOUT_MS = 180_000;

export function createOllamaProvider(): AiProvider {
  const defaultModel = process.env.OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL;

  return {
    id: "ollama",
    name: "Local AI Engine",
    capabilities: ["chat"],
    defaultModel,
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      const model = request.model ?? defaultModel;

      if (!model.trim()) {
        throw new AiValidationError("A local model name is required.");
      }

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      const engine = request.apiKey || "ollama";
      const isOllama = engine === "ollama";

      // Dynamically resolve base URL from environment or custom localStorage override
      const baseUrl = normalizeBaseUrl(
        process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL
      );

      const targetUrl = isOllama
        ? `${baseUrl}/api/chat`
        : `${baseUrl}/v1/chat/completions`;

      const requestBody = isOllama
        ? {
            model,
            messages: request.messages,
            stream: false,
            options: {
              temperature: request.temperature,
              num_predict: request.maxTokens,
            },
          }
        : {
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: false,
          };

      const response = await fetchWithTimeout(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: request.signal,
      }, engine);

      if (!response.ok) {
        const details = await readProviderError(response);

        if (response.status === 404 && isOllama) {
          throw new AiProviderRequestError(
            `Local Ollama model "${model}" was not found. Pull it with "ollama pull ${model}" first.`,
            400
          );
        }

        const errorStatus = response.status === 429
          ? 429
          : (response.status === 404 ? 400 : (response.status >= 500 ? 502 : response.status));
        throw new AiProviderRequestError(
          details || `Local engine "${engine}" returned HTTP ${response.status}.`,
          errorStatus
        );
      }

      const payload = await response.json();

      if (isOllama) {
        const content = payload.message?.content;
        if (!content) {
          throw new AiProviderRequestError("Local Ollama returned an empty response.");
        }
        return {
          providerId: "ollama",
          model: payload.model ?? model,
          content,
          usage: {
            promptTokens: payload.prompt_eval_count,
            completionTokens: payload.eval_count,
            totalTokens:
              typeof payload.prompt_eval_count === "number" && typeof payload.eval_count === "number"
                ? payload.prompt_eval_count + payload.eval_count
                : undefined,
          },
          metadata: {
            engine,
            totalDurationMs: durationNanosToMs(payload.total_duration),
            loadDurationMs: durationNanosToMs(payload.load_duration),
          },
        };
      } else {
        const content = payload.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
          throw new AiProviderRequestError(`Local engine "${engine}" returned an invalid OpenAI-compatible response structure.`);
        }
        return {
          providerId: "ollama",
          model: payload.model ?? model,
          content,
          usage: {
            promptTokens: payload.usage?.prompt_tokens,
            completionTokens: payload.usage?.completion_tokens,
            totalTokens: payload.usage?.total_tokens,
          },
          metadata: {
            engine,
            nativeModel: payload.model ?? model,
          },
        };
      }
    },

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
      const model = request.model ?? defaultModel;

      if (!model.trim()) {
        throw new AiValidationError("A local model name is required.");
      }

      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      const engine = request.apiKey || "ollama";
      const isOllama = engine === "ollama";

      const baseUrl = normalizeBaseUrl(
        process.env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL
      );

      const targetUrl = isOllama
        ? `${baseUrl}/api/chat`
        : `${baseUrl}/v1/chat/completions`;

      const requestBody = isOllama
        ? {
            model,
            messages: request.messages,
            stream: true,
            options: {
              temperature: request.temperature,
              num_predict: request.maxTokens,
            },
          }
        : {
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: true,
          };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const details = await readProviderError(response);
        throw new AiProviderRequestError(
          details || `Local engine "${engine}" returned HTTP ${response.status}.`,
          response.status
        );
      }

      if (!response.body) {
        throw new AiProviderRequestError("Local engine did not return a response body.");
      }

      // Create a transform stream to convert Ollama format to standard format
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
                  if (isOllama) {
                    // Ollama streaming format: { message: { content: "..." } }
                    const content = parsed.message?.content;
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(content));
                    }
                  } else {
                    // OpenAI-compatible format: { choices: [{ delta: { content: "..." } }] }
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(content));
                    }
                  }
                } catch {
                  // If not JSON, pass through
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

async function fetchWithTimeout(
  input: string,
  init: RequestInit & { signal?: AbortSignal },
  engine: string
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  if (init.signal) {
    init.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderUnavailableError(
        `Local engine "${engine}" did not respond before the request timed out.`
      );
    }

    throw new AiProviderUnavailableError(
      `AI Studio could not reach the local engine "${engine}". Ensure the engine server is running and the configured base URL is reachable.`
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function readProviderError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" ? payload.error : "";
  } catch {
    return "";
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function durationNanosToMs(duration?: number) {
  return typeof duration === "number" ? Math.round(duration / 1_000_000) : 0;
}