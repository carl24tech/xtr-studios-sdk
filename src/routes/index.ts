import { HttpClient } from "../lib/http";
import { ENDPOINTS, BASE_URL } from "../lib/constants";
import { RouteDefinition, HttpMethod } from "../lib/types";
import { interpolatePath, buildQueryString } from "../lib/utils";

export interface RouteParams {
  [key: string]: string | number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export class Router {
  private readonly client: HttpClient;
  private registeredRoutes: Map<string, RouteDefinition> = new Map();

  constructor(client: HttpClient) {
    this.client = client;
  }

  register(name: string, definition: RouteDefinition): this {
    this.registeredRoutes.set(name, definition);
    return this;
  }

  deregister(name: string): this {
    this.registeredRoutes.delete(name);
    return this;
  }

  getRegistered(name: string): RouteDefinition | undefined {
    return this.registeredRoutes.get(name);
  }

  listRoutes(): RouteDefinition[] {
    return Array.from(this.registeredRoutes.values());
  }

  resolve(
    path: string,
    pathParams?: RouteParams,
    queryParams?: QueryParams
  ): string {
    const resolvedPath = pathParams ? interpolatePath(path, pathParams) : path;
    const filteredQuery: Record<string, unknown> = {};
    if (queryParams) {
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined) filteredQuery[k] = v;
      });
    }
    const qs = Object.keys(filteredQuery).length > 0 ? buildQueryString(filteredQuery) : "";
    return `${this.client.getBaseUrl()}${resolvedPath}${qs}`;
  }

  async call<T>(
    name: string,
    pathParams?: RouteParams,
    queryParams?: QueryParams,
    body?: unknown
  ): Promise<T> {
    const route = this.registeredRoutes.get(name);
    if (!route) throw new Error(`Route "${name}" is not registered`);
    const url = this.resolve(route.path, pathParams, queryParams);
    const response = await this.client.request<T>(url, {
      method: route.method,
      body,
    });
    return response.data;
  }
}

export class RouteBuilder {
  private routes: RouteDefinition[] = [];

  add(
    path: string,
    method: HttpMethod,
    handler: string,
    options: { middleware?: string[]; auth?: boolean } = {}
  ): this {
    this.routes.push({
      path,
      method,
      handler,
      middleware: options.middleware,
      auth: options.auth,
    });
    return this;
  }

  get(path: string, handler: string, options?: { middleware?: string[]; auth?: boolean }): this {
    return this.add(path, "GET", handler, options);
  }

  post(path: string, handler: string, options?: { middleware?: string[]; auth?: boolean }): this {
    return this.add(path, "POST", handler, options);
  }

  put(path: string, handler: string, options?: { middleware?: string[]; auth?: boolean }): this {
    return this.add(path, "PUT", handler, options);
  }

  patch(path: string, handler: string, options?: { middleware?: string[]; auth?: boolean }): this {
    return this.add(path, "PATCH", handler, options);
  }

  delete(path: string, handler: string, options?: { middleware?: string[]; auth?: boolean }): this {
    return this.add(path, "DELETE", handler, options);
  }

  build(): RouteDefinition[] {
    return [...this.routes];
  }
}

export function defaultRoutes(client: HttpClient): Router {
  const router = new Router(client);

  const allRoutes = [
    ...Object.entries(ENDPOINTS.movies).map(([handler, path]) => ({
      path,
      method: "GET" as HttpMethod,
      handler: `movies.${handler}`,
      auth: false,
    })),
    ...Object.entries(ENDPOINTS.series).map(([handler, path]) => ({
      path,
      method: "GET" as HttpMethod,
      handler: `series.${handler}`,
      auth: false,
    })),
    ...Object.entries(ENDPOINTS.stream).map(([handler, path]) => ({
      path,
      method: "GET" as HttpMethod,
      handler: `stream.${handler}`,
      auth: true,
    })),
    {
      path: ENDPOINTS.auth.login,
      method: "POST" as HttpMethod,
      handler: "auth.login",
      auth: false,
    },
    {
      path: ENDPOINTS.auth.register,
      method: "POST" as HttpMethod,
      handler: "auth.register",
      auth: false,
    },
    {
      path: ENDPOINTS.auth.logout,
      method: "POST" as HttpMethod,
      handler: "auth.logout",
      auth: true,
    },
    {
      path: ENDPOINTS.auth.refresh,
      method: "POST" as HttpMethod,
      handler: "auth.refresh",
      auth: true,
    },
    {
      path: ENDPOINTS.auth.me,
      method: "GET" as HttpMethod,
      handler: "auth.me",
      auth: true,
    },
  ];

  allRoutes.forEach((route) => {
    router.register(route.handler, route);
  });

  return router;
}

export { ENDPOINTS, BASE_URL };
