export interface ProviderMetadata {

  id: string;

  name: string;

  vendor: string;

  version: string;

  website?: string;

  supportsChat: boolean;

  supportsVision: boolean;

  supportsStreaming: boolean;

  supportsToolCalling: boolean;

  supportsEmbeddings: boolean;

  supportsImageGeneration: boolean;

  supportsAudio: boolean;

  supportsVideo: boolean;

}
