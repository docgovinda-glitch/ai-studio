# AI Studio Engineering Instructions

## Project Overview

AI Studio is a modular AI Operating System built with Next.js 16, TypeScript, Tailwind CSS v4, and shadcn/ui.

The platform supports multiple AI providers, including OpenAI, Google Gemini, Anthropic, and Ollama.

All AI features must communicate through the internal AI Engine rather than directly with provider SDKs.

## Architecture Principles

- Server Components by default.
- Client Components only when interactivity is required.
- Prefer composition over inheritance.
- Keep business logic out of UI components.
- Reusable components belong in components/.
- Feature-specific code belongs in features/.
- Infrastructure belongs in lib/.

## Folder Responsibilities

- app/ — App Router
- components/ — Shared UI
- features/ — Product features
- lib/ — Infrastructure
- server/ — Server Actions
- docs/ — Documentation

## AI Architecture

Never call provider SDKs directly from UI components.

All AI requests flow through:

AI Service → Provider Registry → AI Provider

## Quality Requirements

Before every commit:

- npm run build passes
- npm run lint passes
- No TypeScript errors
- Responsive UI
- Reusable components

## Git Workflow

Commit logical units of work with clear commit messages.
