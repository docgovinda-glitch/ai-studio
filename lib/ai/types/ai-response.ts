export interface AIResponse {
  content: string;
  model: string;
  provider: string;

  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };

  finishReason?: string;
}
