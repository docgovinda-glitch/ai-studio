export interface ProviderHealth {

  providerId: string;

  healthy: boolean;

  lastChecked: Date;

  latency: number;

  failures: number;

}
