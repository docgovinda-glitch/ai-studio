# Milestone 03 - AI Engine Foundation

## Goal

Create the first provider-agnostic AI execution path for AI Studio.

## Implemented Scope

- Server-only AI Kernel contracts in `lib/ai`.
- Typed provider errors and validation errors.
- Ollama chat provider adapter.
- `POST /api/chat` route handler.
- `/chat` page using the shared application shell.
- Client chat workspace with provider model override.
- Path-aware navigation for desktop and mobile app navigation.

## Provider Configuration

The Ollama adapter reads these server-side environment variables:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1
```

Both variables are optional. If unset, AI Studio uses the defaults above.

## Non-Goals

- Streaming responses.
- Conversation persistence.
- Authentication and rate limiting.
- Cloud provider adapters.
- Project-linked generated assets.

## Verification

The application must pass:

```bash
npm run lint
npm run build
```
