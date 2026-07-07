import "server-only";

import {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiGenerateImageRequest,
  AiGenerateImageResponse,
  AiGenerateVoiceRequest,
  AiGenerateVoiceResponse,
  AiGenerateVideoRequest,
  AiGenerateVideoResponse,
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

export const OPENAI_IMAGE_MODELS = [
  "dall-e-3",
  "dall-e-2",
];

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_IMAGE_MODEL = "dall-e-3";
const BASE_URL = "https://api.openai.com/v1/chat/completions";
const IMAGE_URL = "https://api.openai.com/v1/images/generations";
const TIMEOUT_MS = 30_000;

export function createOpenAIProvider(): AiProvider {
  const defaultModel = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  return {
    id: "openai",
    name: "OpenAI (Cloud)",
    capabilities: ["chat", "image", "voice", "video"],
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

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
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
          stream: true,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens,
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

      if (!response.body) {
        throw new AiProviderRequestError(
          "OpenAI API did not return a response body.",
          500
        );
      }

      // Create a transform stream to convert OpenAI streaming format
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

    async generateImage(
      request: AiGenerateImageRequest
    ): Promise<AiGenerateImageResponse> {
      const apiKey = request.apiKey ?? process.env.OPENAI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenAI API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      const model = request.model ?? DEFAULT_IMAGE_MODEL;

      if (!request.prompt || !request.prompt.trim()) {
        throw new AiValidationError("A prompt is required for image generation.");
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      try {
        const response = await fetch(IMAGE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: request.prompt,
            size: request.size || "1024x1024",
            quality: request.quality || "standard",
            n: 1,
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
            `OpenAI Image generation failed: ${parsedError}`,
            response.status
          );
        }

        const payload = await response.json();
        const imageUrl = payload.data?.[0]?.url;

        if (!imageUrl) {
          throw new AiProviderRequestError(
            "OpenAI API returned an invalid image response structure.",
            500
          );
        }

        return {
          providerId: "openai",
          model,
          imageUrl,
          metadata: {
            revisedPrompt: payload.data?.[0]?.revised_prompt,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "OpenAI image request timed out before returning a response."
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

    async generateVoice(
      request: AiGenerateVoiceRequest
    ): Promise<AiGenerateVoiceResponse> {
      const apiKey = request.apiKey ?? process.env.OPENAI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenAI API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      if (!request.text || !request.text.trim()) {
        throw new AiValidationError("Text is required for voice generation.");
      }

      const model = request.model ?? "tts-4o-mini";
      const voice = request.voice ?? "alloy";
      const speed = request.speed ?? 1.0;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: request.text,
            voice,
            speed,
            response_format: request.format || "mp3",
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
            `OpenAI Voice generation failed: ${parsedError}`,
            response.status
          );
        }

        // Convert audio to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:audio/mp3;base64,${base64}`;

        return {
          providerId: "openai",
          model,
          audioBase64: dataUrl,
          metadata: {
            voice,
            speed,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "OpenAI voice request timed out before returning a response."
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

    async generateVideo(
      request: AiGenerateVideoRequest
    ): Promise<AiGenerateVideoResponse> {
      const apiKey = request.apiKey ?? process.env.OPENAI_API_KEY;

      if (!apiKey || !apiKey.trim()) {
        throw new AiProviderUnavailableError(
          "OpenAI API key is missing. Set it in Settings to enable this cloud provider."
        );
      }

      if (!request.prompt || !request.prompt.trim()) {
        throw new AiValidationError("A prompt is required for video generation.");
      }

      const model = request.model ?? "sora";
      const duration = request.duration ?? 5;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      if (request.signal) {
        request.signal.addEventListener("abort", () => controller.abort(), {
          once: true,
        });
      }

      try {
        // Note: Sora API is not yet publicly available, this is a placeholder
        // When Sora becomes available, update the endpoint and request format
        const response = await fetch("https://api.openai.com/v1/videos/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: request.prompt,
            duration,
            style: request.style,
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
            `OpenAI Video generation failed: ${parsedError}`,
            response.status
          );
        }

        const payload = await response.json();
        const videoUrl = payload.data?.[0]?.url;

        return {
          providerId: "openai",
          model,
          videoUrl,
          metadata: {
            duration,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AiProviderUnavailableError(
              "OpenAI video request timed out before returning a response."
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
