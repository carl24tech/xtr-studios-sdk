"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtrStreamError = exports.XtrTimeoutError = exports.XtrValidationError = exports.XtrRateLimitError = exports.XtrNotFoundError = exports.XtrAuthError = exports.XtrNetworkError = exports.XtrError = void 0;
exports.isXtrError = isXtrError;
exports.fromHttpStatus = fromHttpStatus;
class XtrError extends Error {
    constructor(message, code, status, details) {
        super(message);
        this.name = "XtrError";
        this.code = code;
        this.status = status;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.XtrError = XtrError;
class XtrNetworkError extends XtrError {
    constructor(message, details) {
        super(message, "NETWORK_ERROR", undefined, details);
        this.name = "XtrNetworkError";
    }
}
exports.XtrNetworkError = XtrNetworkError;
class XtrAuthError extends XtrError {
    constructor(message = "Authentication failed") {
        super(message, "AUTH_ERROR", 401);
        this.name = "XtrAuthError";
    }
}
exports.XtrAuthError = XtrAuthError;
class XtrNotFoundError extends XtrError {
    constructor(resource) {
        super(`${resource} not found`, "NOT_FOUND", 404);
        this.name = "XtrNotFoundError";
    }
}
exports.XtrNotFoundError = XtrNotFoundError;
class XtrRateLimitError extends XtrError {
    constructor(retryAfter) {
        super("Rate limit exceeded", "RATE_LIMITED", 429);
        this.name = "XtrRateLimitError";
        this.retryAfter = retryAfter;
    }
}
exports.XtrRateLimitError = XtrRateLimitError;
class XtrValidationError extends XtrError {
    constructor(message, details) {
        super(message, "VALIDATION_ERROR", 400, details);
        this.name = "XtrValidationError";
    }
}
exports.XtrValidationError = XtrValidationError;
class XtrTimeoutError extends XtrError {
    constructor(timeout) {
        super(`Request timed out after ${timeout}ms`, "TIMEOUT", undefined);
        this.name = "XtrTimeoutError";
    }
}
exports.XtrTimeoutError = XtrTimeoutError;
class XtrStreamError extends XtrError {
    constructor(message, details) {
        super(message, "STREAM_ERROR", undefined, details);
        this.name = "XtrStreamError";
    }
}
exports.XtrStreamError = XtrStreamError;
function isXtrError(error) {
    return error instanceof XtrError;
}
function fromHttpStatus(status, message, details) {
    switch (status) {
        case 401:
            return new XtrAuthError(message);
        case 404:
            return new XtrNotFoundError(message ?? "Resource");
        case 429:
            return new XtrRateLimitError();
        default:
            return new XtrError(message ?? "An unexpected error occurred", "UNKNOWN", status, details);
    }
}
//# sourceMappingURL=errors.js.map