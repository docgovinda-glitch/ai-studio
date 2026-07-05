export class AiKernelError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, options: { code: string; status?: number }) {
    super(message);
    this.name = "AiKernelError";
    this.code = options.code;
    this.status = options.status ?? 500;
  }
}

export class AiProviderUnavailableError extends AiKernelError {
  constructor(message: string) {
    super(message, { code: "AI_PROVIDER_UNAVAILABLE", status: 503 });
    this.name = "AiProviderUnavailableError";
  }
}

export class AiProviderRequestError extends AiKernelError {
  constructor(message: string, status = 502) {
    super(message, { code: "AI_PROVIDER_REQUEST_FAILED", status });
    this.name = "AiProviderRequestError";
  }
}

export class AiValidationError extends AiKernelError {
  constructor(message: string) {
    super(message, { code: "AI_VALIDATION_ERROR", status: 400 });
    this.name = "AiValidationError";
  }
}
