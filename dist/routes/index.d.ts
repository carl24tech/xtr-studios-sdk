import { HttpClient } from "../lib/http";
import { ENDPOINTS, BASE_URL } from "../lib/constants";
import { RouteDefinition, HttpMethod } from "../lib/types";

export interface RouteParams {
    [key: string]: string | number;
}

export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

export declare class Router {
    private readonly client;
    private registeredRoutes;
    constructor(client: HttpClient);
    register(name: string, definition: RouteDefinition): this;
    deregister(name: string): this;
    getRegistered(name: string): RouteDefinition | undefined;
    listRoutes(): RouteDefinition[];
    resolve(path: string, pathParams?: RouteParams, queryParams?: QueryParams): string;
    call<T>(name: string, pathParams?: RouteParams, queryParams?: QueryParams, body?: unknown): Promise<T>;
}

export declare class RouteBuilder {
    private routes;
    add(path: string, method: HttpMethod, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    get(path: string, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    post(path: string, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    put(path: string, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    patch(path: string, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    delete(path: string, handler: string, options?: {
        middleware?: string[];
        auth?: boolean;
    }): this;
    build(): RouteDefinition[];
}

export declare function defaultRoutes(client: HttpClient): Router;

export { ENDPOINTS, BASE_URL };
export type { RouteDefinition, HttpMethod };
