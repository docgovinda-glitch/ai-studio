import type { ProviderRequest } from "./provider-request";
import type { ProviderResponse } from "./provider-response";
import type { ProviderMetadata } from "./provider-metadata";
import type { ProviderConfig } from "./provider-config";

export interface AIProvider {

  readonly config: ProviderConfig;

  readonly metadata: ProviderMetadata;

  generate(
    request: ProviderRequest
  ): Promise<ProviderResponse>;

  stream(
    request: ProviderRequest
  ): Promise<ReadableStream<Uint8Array>>;

  health(): Promise<boolean>;

}
