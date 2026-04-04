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
        await handler(ctx);
      }
    };
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
    logger(`[XtrSDK] [${id}] ${ctx.request.method ?? "GET"} ${ctx.request.url}`);
    await ctx.next();
    const duration = Date.now() - start;
    logger(`[XtrSDK] [${id}] Completed in ${duration}ms`);
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
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }

    if (requests.length >= maxRequests) {
      throw new Error(
        `Rate limit exceeded: maximum ${maxRequests} requests per ${windowMs}ms`
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

export function retryMiddleware(
  maxRetries = 3,
  retryDelay = 1000
): MiddlewareHandler {
  let attempt = 0;
  return async (ctx: MiddlewareContext): Promise<void> => {
    const execute = async (): Promise<void> => {
      try {
        await ctx.next();
      } catch (err) {
        if (attempt >= maxRetries) throw err;
        attempt++;
        await new Promise((r) => setTimeout(r, retryDelay * Math.pow(2, attempt - 1)));
        return execute();
      }
    };
    return execute();
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
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      await Promise.race([ctx.next(), timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
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
