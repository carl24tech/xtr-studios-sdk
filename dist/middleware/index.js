"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewarePipeline = void 0;
exports.loggingMiddleware = loggingMiddleware;
exports.authMiddleware = authMiddleware;
exports.rateLimitMiddleware = rateLimitMiddleware;
exports.cacheMiddleware = cacheMiddleware;
exports.retryMiddleware = retryMiddleware;
exports.headerMiddleware = headerMiddleware;
exports.timeoutMiddleware = timeoutMiddleware;
exports.createMiddlewareContext = createMiddlewareContext;
const utils_1 = require("../lib/utils");
class MiddlewarePipeline {
    constructor() {
        this.handlers = [];
    }
    use(handler) {
        this.handlers.push(handler);
        return this;
    }
    remove(handler) {
        this.handlers = this.handlers.filter((h) => h !== handler);
        return this;
    }
    clear() {
        this.handlers = [];
        return this;
    }
    async run(ctx) {
        let index = 0;
        const next = async () => {
            if (index < this.handlers.length) {
                const handler = this.handlers[index++];
                await handler({ ...ctx, next });
            }
        };
        ctx.next = next;
        await next();
    }
    count() {
        return this.handlers.length;
    }
}
exports.MiddlewarePipeline = MiddlewarePipeline;
function loggingMiddleware(logger = console.log) {
    return async (ctx) => {
        const start = Date.now();
        const id = (0, utils_1.generateRequestId)();
        logger(`[XtrSDK] [${id}] Request started`);
        await ctx.next();
        const duration = Date.now() - start;
        logger(`[XtrSDK] [${id}] Request completed in ${duration}ms`);
    };
}
function authMiddleware(getToken) {
    return async (ctx) => {
        const token = getToken();
        if (token) {
            ctx.request.headers = {
                ...(ctx.request.headers ?? {}),
                Authorization: `Bearer ${token}`,
            };
        }
        await ctx.next();
    };
}
function rateLimitMiddleware(maxRequests, windowMs) {
    const requests = [];
    return async (ctx) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        const recentRequests = requests.filter((t) => t > windowStart);
        if (recentRequests.length >= maxRequests) {
            throw new Error(`Rate limit: max ${maxRequests} requests per ${windowMs}ms exceeded`);
        }
        requests.push(now);
        await ctx.next();
    };
}
function cacheMiddleware(ttlMs = 60000) {
    const cache = new Map();
    return async (ctx) => {
        const method = ctx.request.method ?? "GET";
        if (method !== "GET") {
            await ctx.next();
            return;
        }
        const cacheKey = JSON.stringify(ctx.request);
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            ctx.response = cached.data;
            return;
        }
        await ctx.next();
        if (ctx.response?.ok) {
            cache.set(cacheKey, {
                data: ctx.response,
                expires: Date.now() + ttlMs,
            });
        }
    };
}
function retryMiddleware(maxRetries = 3, retryDelay = 1000) {
    return async (ctx) => {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await ctx.next();
                return;
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                if (attempt < maxRetries) {
                    await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt)));
                }
            }
        }
        throw lastError;
    };
}
function headerMiddleware(headers) {
    return async (ctx) => {
        ctx.request.headers = {
            ...headers,
            ...(ctx.request.headers ?? {}),
        };
        await ctx.next();
    };
}
function timeoutMiddleware(timeoutMs) {
    return async (ctx) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const originalOptions = ctx.request;
        originalOptions.signal = controller.signal;
        try {
            await ctx.next();
        }
        finally {
            clearTimeout(timer);
        }
    };
}
function createMiddlewareContext(request, metadata = {}) {
    return {
        request,
        next: async () => { },
        metadata,
    };
}
//# sourceMappingURL=index.js.map