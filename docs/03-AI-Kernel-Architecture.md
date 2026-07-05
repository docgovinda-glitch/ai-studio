# Purpose

The AI Studio Kernel is the central AI execution layer for AI Studio. It defines the shared contracts, routing rules, and provider interfaces used by every AI-powered feature in the platform.

The Kernel exists to keep AI capabilities consistent, secure, and extensible across modules such as chat, writing, voice, image, video, research, agents, and workflow automation. Instead of each feature integrating directly with a model provider, every feature depends on the Kernel for model selection, capability handling, request normalization, response formatting, error handling, and usage tracking.

The architecture is provider-agnostic so AI Studio is not coupled to any single vendor, SDK, or deployment model. Providers such as OpenAI, Anthropic Claude, Google Gemini, Ollama, Google Colab, local GPUs, and future integrations can be added behind the same internal interface.

This design supports both local and cloud AI providers by treating each provider as an interchangeable adapter with declared capabilities. Cloud models can power hosted workflows, while local providers can support private, offline, or GPU-backed execution without changing feature-level code.

# Current Implementation

The first implementation slice adds chat execution through Ollama.

- `lib/ai/types.ts` defines provider-agnostic message, provider, capability, request, and response contracts.
- `lib/ai/errors.ts` defines typed kernel/provider errors with HTTP-safe status codes.
- `lib/ai/kernel.ts` registers providers and routes chat requests to the selected provider.
- `lib/ai/providers/ollama.ts` implements the Ollama `/api/chat` adapter behind the shared provider interface.
- `app/api/chat/route.ts` is the server-side HTTP boundary used by the chat UI.
- `features/chat/components/chat-workspace.tsx` provides the client-side chat experience.

Provider code is server-only. Client components call the internal route handler and never access provider configuration, local endpoints, credentials, or environment variables directly.

# Ollama Provider

The Ollama provider defaults to:

- Base URL: `http://127.0.0.1:11434`
- Model: `llama3.1`

Configuration is read on the server:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

Before using the chat UI, Ollama must be running locally and the configured model must be available:

```bash
ollama pull llama3.1
ollama serve
```

# Request Flow

1. The `/chat` page renders the AI Chat workspace inside the shared application shell.
2. The client component submits validated chat history to `POST /api/chat`.
3. The route handler validates message shape, count, length, and optional model override.
4. The AI Kernel selects the `ollama` provider.
5. The Ollama adapter calls the local Ollama HTTP API with `stream: false`.
6. The route handler returns a minimal DTO containing the assistant message, provider metadata, usage, and timing metadata.

# Extension Path

Future providers should implement the `AiProvider` interface and register with `AiKernel`. Feature code should continue depending on the Kernel rather than provider-specific SDKs or HTTP details.
