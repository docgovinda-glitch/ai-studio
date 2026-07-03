/**
 * Capabilities that an AI provider may support.
 */
export enum ProviderCapability {
  CHAT = "chat",

  REASONING = "reasoning",

  VISION = "vision",

  IMAGE_GENERATION = "image-generation",

  AUDIO = "audio",

  VIDEO = "video",

  EMBEDDINGS = "embeddings",

  TOOL_CALLING = "tool-calling",

  FUNCTION_CALLING = "function-calling",

  STREAMING = "streaming",

  JSON_OUTPUT = "json-output",

  LONG_CONTEXT = "long-context",
}
