export interface ProviderQuota {

  providerId: string;

  remaining: number;

  limit: number;

  resetAt?: Date;

}
