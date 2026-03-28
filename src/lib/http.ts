import {
  XtrClientConfig,
  ApiResponse,
  RequestOptions,
} from "./types";
import {
  XtrNetworkError,
  XtrTimeoutError,
  XtrRateLimitError,
  fromHttpStatus,
} from "./errors";
import {
  BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRIES,
  DEFAULT_RETRY_DELAY,
  SDK_USER_AGENT,
} from "./constants";

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly retryDelay: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: XtrClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": SDK_USER_AGENT,
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...(config.headers ?? {}),
    };
  }

  buildUrl(path: string, params?: Record<string, string | number>): string {
    let fullPath = path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        fullPath = fullPath.replace(`:${key}`, String(value));
      });
    }
    return `${this.baseUrl}${fullPath}`;
  }

  buildQueryString(params: Record<string, unknown>): string {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join("&");
    return query ? `?${query}` : "";
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseResponseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", headers = {}, body, signal } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const abortSignal = signal ?? controller.signal;

    const mergedHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    const fetchOptions: RequestInit = {
      method,
      headers: mergedHeaders,
      signal: abortSignal,
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
    };

    let lastError: Error = new Error("Unknown error");

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        const responseHeaders = this.parseResponseHeaders(response.headers);

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          throw new XtrRateLimitError(
            retryAfter ? parseInt(retryAfter, 10) : undefined
          );
        }

        let data: T;
        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        if (!response.ok) {
          const errorData = data as Record<string, unknown>;
          throw fromHttpStatus(
            response.status,
            typeof errorData?.message === "string"
              ? errorData.message
              : response.statusText,
            data
          );
        }

        return {
          data,
          status: response.status,
          ok: response.ok,
          headers: responseHeaders,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === "AbortError") {
          throw new XtrTimeoutError(this.timeout);
        }

        if (
          error instanceof XtrRateLimitError ||
          (error instanceof Error &&
            error.message.includes("fetch"))
        ) {
          lastError = error;
          if (attempt < this.retries) {
            await this.sleep(this.retryDelay * Math.pow(2, attempt));
            continue;
          }
        }

        if (error instanceof Error) {
          if (
            error.name !== "XtrError" &&
            error.name !== "XtrAuthError" &&
            error.name !== "XtrNotFoundError" &&
            error.name !== "XtrRateLimitError" &&
            error.name !== "XtrValidationError"
          ) {
            throw new XtrNetworkError(error.message, error);
          }
        }

        throw error;
      }
    }

    throw new XtrNetworkError(lastError.message, lastError);
  }

  async get<T>(
    url: string,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "POST", body });
  }

  async put<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "PUT", body });
  }

  async patch<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "PATCH", body });
  }

  async delete<T>(
    url: string,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }

  setApiKey(apiKey: string): void {
    this.defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
