export interface ProviderConfig {
  id: string;

  name: string;

  enabled: boolean;

  apiKey?: string;

  baseUrl?: string;

  defaultModel?: string;

  timeout?: number;
}
