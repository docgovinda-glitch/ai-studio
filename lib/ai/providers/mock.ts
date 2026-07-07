import "server-only";

import {
  AiGenerateTextRequest,
  AiGenerateTextResponse,
  AiGenerateImageRequest,
  AiGenerateImageResponse,
  AiProvider,
} from "@/lib/ai/types";
import { AiValidationError } from "@/lib/ai/errors";

export function createMockProvider(): AiProvider {
  return {
    id: "mock",
    name: "Developer Mock",
    capabilities: ["chat", "image"],
    defaultModel: "mock-model-v1",
    async generateText(
      request: AiGenerateTextRequest
    ): Promise<AiGenerateTextResponse> {
      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      // Simulate a small network delay for realistic UI loading states
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lastMessage = request.messages[request.messages.length - 1];
      const content = lastMessage.content.toLowerCase();

      let mockReply = "";

      if (content.includes("outline") || content.includes("blog") || content.includes("draft") || content.includes("write")) {
        mockReply = `### AI Studio Content Draft Outline

Here is a structured draft suggestion based on your query:

1. **Introduction**
   - Grab attention with a hook.
   - Define the core topic and relevance.
   - Summarize the thesis.

2. **Core Concepts & Key Pillars**
   - **Pillar A:** Technical feasibility & architectural simplicity.
   - **Pillar B:** User experience (UX) & developer experience (DX).
   - **Pillar C:** Extensibility & robust provider routing.

3. **Implementation Timeline**
   - Phase 1: Interactive mockup and schema definition.
   - Phase 2: Live provider integration and error tolerance.
   - Phase 3: Deployment, monitoring, and telemetry hookups.

4. **Conclusion**
   - Summary of key takeaways.
   - Next actionable steps.

*Generated automatically by the AI Studio Writing assistant.*`;
      } else if (content.includes("project")) {
        mockReply = `AI Studio supports organizing work into independent workspaces called **Projects**. 

A project can bundle:
- Writing drafts and scripts
- Generated image prompts and assets
- Narration storyboards
- Custom local/cloud models configurations

To get started, click the "New Project" button in the navigation or dashboard.`;
      } else if (content.includes("voice") || content.includes("audio") || content.includes("speak")) {
        mockReply = `Voice Studio supports Text-to-Speech narration generation, voice cloning, and audio transcription workflows.

You can specify tone parameters (e.g., *Professional*, *Energetic*, *Calm*) and generate high-fidelity speech previews. Connect cloud speech APIs or run local cloning models behind the AI Kernel adapter.`;
      } else if (content.includes("image") || content.includes("generate")) {
        mockReply = `Image Studio permits prompt-based generation of assets.

Recommended styling keywords:
- **Style**: *Cinematic, Photorealistic, Minimalist vector, 3D render*
- **Composition**: *Macro close-up, wide landscape, isometric view*
- **Lighting**: *Golden hour, studio soft light, high contrast*`;
      } else {
        mockReply = `Hello! I am AI Studio's offline Developer Mock model. 

I'm processing your request using the local Mock provider adapter because:
1. Local Ollama instance is not detected or was bypassed.
2. You are in offline/development mode.

You can ask me to draft blog posts, outline projects, or explain Voice and Image studio features to see how the system interfaces between client views and the AI Kernel backend.`;
      }

      const promptTokens = lastMessage.content.split(/\s+/).length + 10;
      const completionTokens = mockReply.split(/\s+/).length;

      return {
        providerId: "mock",
        model: request.model ?? "mock-model-v1",
        content: mockReply,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        metadata: {
          simulatedDelayMs: 800,
          offlineMode: true,
        },
      };
    },

    async generateTextStream(
      request: AiGenerateTextRequest
    ): Promise<ReadableStream> {
      if (request.messages.length === 0) {
        throw new AiValidationError("At least one chat message is required.");
      }

      const lastMessage = request.messages[request.messages.length - 1];
      const content = lastMessage.content.toLowerCase();

      let mockReply = "";

      if (content.includes("outline") || content.includes("blog") || content.includes("draft") || content.includes("write")) {
        mockReply = `### AI Studio Content Draft Outline

Here is a structured draft suggestion based on your query:

1. **Introduction**
   - Grab attention with a hook.
   - Define the core topic and relevance.
   - Summarize the thesis.

2. **Core Concepts & Key Pillars**
   - **Pillar A:** Technical feasibility & architectural simplicity.
   - **Pillar B:** User experience (UX) & developer experience (DX).
   - **Pillar C:** Extensibility & robust provider routing.

3. **Implementation Timeline**
   - Phase 1: Interactive mockup and schema definition.
   - Phase 2: Live provider integration and error tolerance.
   - Phase 3: Deployment, monitoring, and telemetry hookups.

4. **Conclusion**
   - Summary of key takeaways.
   - Next actionable steps.

*Generated automatically by the AI Studio Writing assistant.*`;
      } else if (content.includes("project")) {
        mockReply = `AI Studio supports organizing work into independent workspaces called **Projects**. 

A project can bundle:
- Writing drafts and scripts
- Generated image prompts and assets
- Narration storyboards
- Custom local/cloud models configurations

To get started, click the "New Project" button in the navigation or dashboard.`;
      } else if (content.includes("voice") || content.includes("audio") || content.includes("speak")) {
        mockReply = `Voice Studio supports Text-to-Speech narration generation, voice cloning, and audio transcription workflows.

You can specify tone parameters (e.g., *Professional*, *Energetic*, *Calm*) and generate high-fidelity speech previews. Connect cloud speech APIs or run local cloning models behind the AI Kernel adapter.`;
      } else if (content.includes("image") || content.includes("generate")) {
        mockReply = `Image Studio permits prompt-based generation of assets.

Recommended styling keywords:
- **Style**: *Cinematic, Photorealistic, Minimalist vector, 3D render*
- **Composition**: *Macro close-up, wide landscape, isometric view*
- **Lighting**: *Golden hour, studio soft light, high contrast*`;
      } else {
        mockReply = `Hello! I am AI Studio's offline Developer Mock model. 

I'm processing your request using the local Mock provider adapter because:
1. Local Ollama instance is not detected or was bypassed.
2. You are in offline/development mode.

You can ask me to draft blog posts, outline projects, or explain Voice and Image studio features to see how the system interfaces between client views and the AI Kernel backend.`;
      }

      // Create a streaming response that simulates typing
      const stream = new ReadableStream({
        async start(controller) {
          const words = mockReply.split(" ");
          for (const word of words) {
            controller.enqueue(new TextEncoder().encode(word + " "));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          controller.close();
        }
      });

      return stream;
    },

    async generateImage(
      request: AiGenerateImageRequest
    ): Promise<AiGenerateImageResponse> {
      if (!request.prompt || !request.prompt.trim()) {
        throw new AiValidationError("A prompt is required for image generation.");
      }

      // Simulate a small network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Return a mock image URL (using a placeholder service)
      const mockImageUrl = `https://placehold.co/1024x1024/6366f1/ffffff/png?text=${encodeURIComponent(request.prompt.substring(0, 50))}`;

      return {
        providerId: "mock",
        model: request.model ?? "mock-image-v1",
        imageUrl: mockImageUrl,
        metadata: {
          simulatedDelayMs: 1200,
          offlineMode: true,
        },
      };
    },
  };
}