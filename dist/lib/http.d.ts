import { XtrClientConfig, ApiResponse, RequestOptions } from "./types";
export declare class HttpClient {
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly timeout;
    private readonly retries;
    private readonly retryDelay;
    private readonly defaultHeaders;
    constructor(config?: XtrClientConfig);
    buildUrl(path: string, params?: Record<string, string | number>): string;
    buildQueryString(params: Record<string, unknown>): string;
    private sleep;
    private parseResponseHeaders;
    request<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    get<T>(url: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>>;
    post<T>(url: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>>;
    put<T>(url: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>>;
    patch<T>(url: string, body?: unknown, options?: Omit<RequestOptions, "method">): Promise<ApiResponse<T>>;
    delete<T>(url: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>>;
    setApiKey(apiKey: string): void;
    setHeader(key: string, value: string): void;
    removeHeader(key: string): void;
    getBaseUrl(): string;
}
//# sourceMappingURL=http.d.ts.map