export class XtrError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status?: number, details?: unknown) {
    super(message);
    this.name = "XtrError";
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class XtrNetworkError extends XtrError {
  constructor(message: string, details?: unknown) {
    super(message, "NETWORK_ERROR", undefined, details);
    this.name = "XtrNetworkError";
  }
}

export class XtrAuthError extends XtrError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    this.name = "XtrAuthError";
  }
}

export class XtrNotFoundError extends XtrError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "XtrNotFoundError";
  }
}

export class XtrRateLimitError extends XtrError {
  readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super("Rate limit exceeded", "RATE_LIMITED", 429);
    this.name = "XtrRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class XtrValidationError extends XtrError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "XtrValidationError";
  }
}

export class XtrTimeoutError extends XtrError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`, "TIMEOUT_ERROR", undefined);
    this.name = "XtrTimeoutError";
  }
}

export class XtrStreamError extends XtrError {
  constructor(message: string, details?: unknown) {
    super(message, "STREAM_ERROR", undefined, details);
    this.name = "XtrStreamError";
  }
}

export function isXtrError(error: unknown): error is XtrError {
  return error instanceof XtrError;
}

export function fromHttpStatus(status: number, message?: string, details?: unknown): XtrError {
  switch (status) {
    case 401:
      return new XtrAuthError(message);
    case 403:
      return new XtrError(message ?? "Forbidden", "FORBIDDEN", status, details);
    case 404:
      return new XtrNotFoundError(message ?? "Resource");
    case 429:
      return new XtrRateLimitError();
    case 500:
      return new XtrError(message ?? "Internal server error", "SERVER_ERROR", status, details);
    default:
      return new XtrError(message ?? "An unexpected error occurred", "UNKNOWN_ERROR", status, details);
  }
}
