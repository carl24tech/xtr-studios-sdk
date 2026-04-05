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
                await handler(ctx);
            }
        };
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
        logger(`[XtrSDK] [${id}] ${ctx.request.method ?? "GET"} ${ctx.request.url}`);
        await ctx.next();
        const duration = Date.now() - start;
        logger(`[XtrSDK] [${id}] Completed in ${duration}ms`);
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
        while (requests.length > 0 && requests[0] < windowStart) {
            requests.shift();
        }
        if (requests.length >= maxRequests) {
            throw new Error(`Rate limit exceeded: maximum ${maxRequests} requests per ${windowMs}ms`);
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
        const cacheKey = `${ctx.request.url}-${JSON.stringify(ctx.request.params)}`;
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
    let attempt = 0;
    return async (ctx) => {
        const execute = async () => {
            try {
                await ctx.next();
            }
            catch (err) {
                if (attempt >= maxRetries) throw err;
                attempt++;
                await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt - 1)));
                return execute();
            }
        };
        return execute();
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
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Request timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        });
        try {
            await Promise.race([ctx.next(), timeoutPromise]);
        }
        finally {
            clearTimeout(timeoutId);
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
