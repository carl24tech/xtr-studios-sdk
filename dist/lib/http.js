"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const errors_1 = require("./errors");
const constants_1 = require("./constants");
class HttpClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl ?? constants_1.BASE_URL;
        this.apiKey = config.apiKey;
        this.timeout = config.timeout ?? constants_1.DEFAULT_TIMEOUT;
        this.retries = config.retries ?? constants_1.DEFAULT_RETRIES;
        this.retryDelay = config.retryDelay ?? constants_1.DEFAULT_RETRY_DELAY;
        this.defaultHeaders = {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": constants_1.SDK_USER_AGENT,
            ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
            ...(config.headers ?? {}),
        };
    }
    buildUrl(path, params) {
        let fullPath = path;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                fullPath = fullPath.replace(`:${key}`, String(value));
            });
        }
        return `${this.baseUrl}${fullPath}`;
    }
    buildQueryString(params) {
        const query = Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join("&");
        return query ? `?${query}` : "";
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    parseResponseHeaders(headers) {
        const result = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    async request(url, options = {}) {
        const { method = "GET", headers = {}, body, signal } = options;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        const abortSignal = signal ?? controller.signal;
        const mergedHeaders = {
            ...this.defaultHeaders,
            ...headers,
        };
        const fetchOptions = {
            method,
            headers: mergedHeaders,
            signal: abortSignal,
            ...(body !== undefined
                ? { body: JSON.stringify(body) }
                : {}),
        };
        let lastError = new Error("Unknown error");
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                const response = await fetch(url, fetchOptions);
                clearTimeout(timeoutId);
                const responseHeaders = this.parseResponseHeaders(response.headers);
                if (response.status === 429) {
                    const retryAfter = response.headers.get("Retry-After");
                    throw new errors_1.XtrRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
                }
                let data;
                const contentType = response.headers.get("content-type") ?? "";
                if (contentType.includes("application/json")) {
                    data = (await response.json());
                }
                else {
                    data = (await response.text());
                }
                if (!response.ok) {
                    const errorData = data;
                    throw (0, errors_1.fromHttpStatus)(response.status, typeof errorData?.message === "string"
                        ? errorData.message
                        : response.statusText, data);
                }
                return {
                    data,
                    status: response.status,
                    ok: response.ok,
                    headers: responseHeaders,
                };
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error instanceof Error && error.name === "AbortError") {
                    throw new errors_1.XtrTimeoutError(this.timeout);
                }
                if (error instanceof errors_1.XtrRateLimitError ||
                    (error instanceof Error &&
                        error.message.includes("fetch"))) {
                    lastError = error;
                    if (attempt < this.retries) {
                        await this.sleep(this.retryDelay * Math.pow(2, attempt));
                        continue;
                    }
                }
                if (error instanceof Error) {
                    if (error.name !== "XtrError" &&
                        error.name !== "XtrAuthError" &&
                        error.name !== "XtrNotFoundError" &&
                        error.name !== "XtrRateLimitError" &&
                        error.name !== "XtrValidationError") {
                        throw new errors_1.XtrNetworkError(error.message, error);
                    }
                }
                throw error;
            }
        }
        throw new errors_1.XtrNetworkError(lastError.message, lastError);
    }
    async get(url, options) {
        return this.request(url, { ...options, method: "GET" });
    }
    async post(url, body, options) {
        return this.request(url, { ...options, method: "POST", body });
    }
    async put(url, body, options) {
        return this.request(url, { ...options, method: "PUT", body });
    }
    async patch(url, body, options) {
        return this.request(url, { ...options, method: "PATCH", body });
    }
    async delete(url, options) {
        return this.request(url, { ...options, method: "DELETE" });
    }
    setApiKey(apiKey) {
        this.defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
    }
    setHeader(key, value) {
        this.defaultHeaders[key] = value;
    }
    removeHeader(key) {
        delete this.defaultHeaders[key];
    }
    getBaseUrl() {
        return this.baseUrl;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http.js.map