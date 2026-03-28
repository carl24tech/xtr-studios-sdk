"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_URL = exports.ENDPOINTS = exports.RouteBuilder = exports.Router = void 0;
exports.defaultRoutes = defaultRoutes;
const constants_1 = require("../lib/constants");
Object.defineProperty(exports, "ENDPOINTS", { enumerable: true, get: function () { return constants_1.ENDPOINTS; } });
Object.defineProperty(exports, "BASE_URL", { enumerable: true, get: function () { return constants_1.BASE_URL; } });
const utils_1 = require("../lib/utils");
class Router {
    constructor(client) {
        this.registeredRoutes = new Map();
        this.client = client;
    }
    register(name, definition) {
        this.registeredRoutes.set(name, definition);
        return this;
    }
    deregister(name) {
        this.registeredRoutes.delete(name);
        return this;
    }
    getRegistered(name) {
        return this.registeredRoutes.get(name);
    }
    listRoutes() {
        return Array.from(this.registeredRoutes.values());
    }
    resolve(path, pathParams, queryParams) {
        const resolvedPath = pathParams ? (0, utils_1.interpolatePath)(path, pathParams) : path;
        const filteredQuery = {};
        if (queryParams) {
            Object.entries(queryParams).forEach(([k, v]) => {
                if (v !== undefined)
                    filteredQuery[k] = v;
            });
        }
        const qs = Object.keys(filteredQuery).length > 0 ? (0, utils_1.buildQueryString)(filteredQuery) : "";
        return `${this.client.getBaseUrl()}${resolvedPath}${qs}`;
    }
    async call(name, pathParams, queryParams, body) {
        const route = this.registeredRoutes.get(name);
        if (!route)
            throw new Error(`Route "${name}" is not registered`);
        const url = this.resolve(route.path, pathParams, queryParams);
        const response = await this.client.request(url, {
            method: route.method,
            body,
        });
        return response.data;
    }
}
exports.Router = Router;
class RouteBuilder {
    constructor() {
        this.routes = [];
    }
    add(path, method, handler, options = {}) {
        this.routes.push({
            path,
            method,
            handler,
            middleware: options.middleware,
            auth: options.auth,
        });
        return this;
    }
    get(path, handler, options) {
        return this.add(path, "GET", handler, options);
    }
    post(path, handler, options) {
        return this.add(path, "POST", handler, options);
    }
    put(path, handler, options) {
        return this.add(path, "PUT", handler, options);
    }
    patch(path, handler, options) {
        return this.add(path, "PATCH", handler, options);
    }
    delete(path, handler, options) {
        return this.add(path, "DELETE", handler, options);
    }
    build() {
        return [...this.routes];
    }
}
exports.RouteBuilder = RouteBuilder;
function defaultRoutes(client) {
    const router = new Router(client);
    const allRoutes = [
        ...Object.entries(constants_1.ENDPOINTS.movies).map(([handler, path]) => ({
            path,
            method: "GET",
            handler: `movies.${handler}`,
            auth: false,
        })),
        ...Object.entries(constants_1.ENDPOINTS.series).map(([handler, path]) => ({
            path,
            method: "GET",
            handler: `series.${handler}`,
            auth: false,
        })),
        ...Object.entries(constants_1.ENDPOINTS.stream).map(([handler, path]) => ({
            path,
            method: "GET",
            handler: `stream.${handler}`,
            auth: true,
        })),
        {
            path: constants_1.ENDPOINTS.auth.login,
            method: "POST",
            handler: "auth.login",
            auth: false,
        },
        {
            path: constants_1.ENDPOINTS.auth.register,
            method: "POST",
            handler: "auth.register",
            auth: false,
        },
        {
            path: constants_1.ENDPOINTS.auth.logout,
            method: "POST",
            handler: "auth.logout",
            auth: true,
        },
        {
            path: constants_1.ENDPOINTS.auth.refresh,
            method: "POST",
            handler: "auth.refresh",
            auth: true,
        },
        {
            path: constants_1.ENDPOINTS.auth.me,
            method: "GET",
            handler: "auth.me",
            auth: true,
        },
    ];
    allRoutes.forEach((route) => {
        router.register(route.handler, route);
    });
    return router;
}
//# sourceMappingURL=index.js.map