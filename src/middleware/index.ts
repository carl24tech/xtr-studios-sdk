import { MiddlewareContext, MiddlewareHandler, RequestOptions, ApiResponse } from "../lib/types";
import { generateRequestId } from "../lib/utils";

export class MiddlewarePipeline {
  private handlers: MiddlewareHandler[] = [];

  use(handler: MiddlewareHandler): this {
    this.handlers.push(handler);
    return this;
  }

  remove(handler: MiddlewareHandler): this {
    this.handlers = this.handlers.filter((h) => h !== handler);
    return this;
  }

  clear(): this {
    this.handlers = [];
    return this;
  }

  async run(ctx: MiddlewareContext): Promise<void> {
    let index = 0;
    const next = async (): Promise<void> => {
      if (index < this.handlers.length) {
        const handler = this.handlers[index++];
        await handler({ ...ctx, next });
      }
    };
    ctx.next = next;
    await next();
  }

  count(): number {
    return this.handlers.length;
  }
}

export function loggingMiddleware(
  logger: (msg: string) => void = console.log
): MiddlewareHandler {
  return async (ctx: MiddlewareContext): Promise<void> => {
    const start = Date.now();
    const id = generateRequestId();
    logger(`[XtrSDK] [${id}] Request started`);
    await ctx.next();
    const duration = Date.now() - start;
    logger(`[XtrSDK] [${id}] Request completed in ${duration}ms`);
  };
}

export function authMiddleware(getToken: () => string | undefined): MiddlewareHandler {
  return async (ctx: MiddlewareContext): Promise<void> => {
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

export function rateLimitMiddleware(
  maxRequests: number,
  windowMs: number
): MiddlewareHandler {
  const requests: number[] = [];

  return async (ctx: MiddlewareContext): Promise<void> => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentRequests = requests.filter((t) => t > windowStart);

    if (recentRequests.length >= maxRequests) {
      throw new Error(
        `Rate limit: max ${maxRequests} requests per ${windowMs}ms exceeded`
      );
    }

    requests.push(now);
    await ctx.next();
  };
}

export function cacheMiddleware(ttlMs = 60_000): MiddlewareHandler {
  const cache = new Map<string, { data: ApiResponse<unknown>; expires: number }>();

  return async (ctx: MiddlewareContext): Promise<void> => {
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

export function retryMiddleware(
  maxRetries = 3,
  retryDelay = 1000
): MiddlewareHandler {
  return async (ctx: MiddlewareContext): Promise<void> => {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await ctx.next();
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError;
  };
}

export function headerMiddleware(
  headers: Record<string, string>
): MiddlewareHandler {
  return async (ctx: MiddlewareContext): Promise<void> => {
    ctx.request.headers = {
      ...headers,
      ...(ctx.request.headers ?? {}),
    };
    await ctx.next();
  };
}

export function timeoutMiddleware(timeoutMs: number): MiddlewareHandler {
  return async (ctx: MiddlewareContext): Promise<void> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const originalOptions = ctx.request as RequestOptions & { signal?: AbortSignal };
    originalOptions.signal = controller.signal;
    try {
      await ctx.next();
    } finally {
      clearTimeout(timer);
    }
  };
}

export function createMiddlewareContext(
  request: RequestOptions,
  metadata: Record<string, unknown> = {}
): MiddlewareContext {
  return {
    request,
    next: async () => {},
    metadata,
  };
}
