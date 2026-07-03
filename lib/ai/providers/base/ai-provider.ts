import type { ProviderConfig } from "./provider-config";
import type { ProviderMetadata } from "./provider-metadata";
import type { ProviderRequest } from "./provider-request";
import type { ProviderResponse } from "./provider-response";

export interface AIProvider {

  readonly config: ProviderConfig;

  readonly metadata: ProviderMetadata;

  generate(
    request: ProviderRequest
  ): Promise<ProviderResponse>;

  health(): Promise<boolean>;

}
