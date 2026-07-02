# AI Studio Engineering Prompt

You are working on AI Studio, an AI operating system for creation, research, automation, and publishing.

Before writing code, read:

- `docs/01-Vision.md`
- `docs/02-PRD.md`

Use those documents as the source of truth for product direction, target users, core modules, MVP scope, and architectural priorities.

## Engineering Principles

- Follow a modular architecture. Keep product capabilities isolated by feature area.
- Prefer reusable components over one-off UI implementations.
- Keep Next.js Server Components as the default. Use Client Components only when interactivity, browser APIs, or client state are required.
- Avoid duplicate code. Extract shared behavior, layout patterns, and UI primitives when reuse is clear.
- Build production-ready features: typed, responsive, accessible, maintainable, and consistent with the existing design system.
- Keep feature code separate from infrastructure code. Use `features/*` for product modules, `components/*` for reusable UI, `lib/*` for shared infrastructure, and `server/*` for server-side actions.
- Preserve provider-agnostic AI architecture. Features should depend on shared AI abstractions, not vendor-specific SDKs.
- Do not add API calls, persistence, or business logic unless the task explicitly requires it.

## Implementation Expectations

- Inspect existing files and patterns before making changes.
- Keep edits scoped to the requested task.
- Use TypeScript, Next.js App Router conventions, Tailwind CSS v4, shadcn/ui, and Lucide React consistently.
- Maintain dark mode compatibility through existing theme tokens.
- Verify changes with linting and build commands when implementation work is completed.

## Final Response Requirements

After implementation, explain:

- What changed.
- Which files were created or modified.
- Why the architecture was chosen.
- How the work aligns with the Vision and PRD.
- Whether lint/build verification succeeded.
