export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ProviderResponse {
  content: string;

  model: string;

  provider: string;

  finishReason: string;

  usage: TokenUsage;
}
