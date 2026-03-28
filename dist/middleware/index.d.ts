import { MiddlewareContext, MiddlewareHandler, RequestOptions } from "../lib/types";
export declare class MiddlewarePipeline {
    private handlers;
    use(handler: MiddlewareHandler): this;
    remove(handler: MiddlewareHandler): this;
    clear(): this;
    run(ctx: MiddlewareContext): Promise<void>;
    count(): number;
}
export declare function loggingMiddleware(logger?: (msg: string) => void): MiddlewareHandler;
export declare function authMiddleware(getToken: () => string | undefined): MiddlewareHandler;
export declare function rateLimitMiddleware(maxRequests: number, windowMs: number): MiddlewareHandler;
export declare function cacheMiddleware(ttlMs?: number): MiddlewareHandler;
export declare function retryMiddleware(maxRetries?: number, retryDelay?: number): MiddlewareHandler;
export declare function headerMiddleware(headers: Record<string, string>): MiddlewareHandler;
export declare function timeoutMiddleware(timeoutMs: number): MiddlewareHandler;
export declare function createMiddlewareContext(request: RequestOptions, metadata?: Record<string, unknown>): MiddlewareContext;
//# sourceMappingURL=index.d.ts.map