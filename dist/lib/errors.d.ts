export declare class XtrError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly details?: unknown;
    constructor(message: string, code: string, status?: number, details?: unknown);
}
export declare class XtrNetworkError extends XtrError {
    constructor(message: string, details?: unknown);
}
export declare class XtrAuthError extends XtrError {
    constructor(message?: string);
}
export declare class XtrNotFoundError extends XtrError {
    constructor(resource: string);
}
export declare class XtrRateLimitError extends XtrError {
    readonly retryAfter?: number;
    constructor(retryAfter?: number);
}
export declare class XtrValidationError extends XtrError {
    constructor(message: string, details?: unknown);
}
export declare class XtrTimeoutError extends XtrError {
    constructor(timeout: number);
}
export declare class XtrStreamError extends XtrError {
    constructor(message: string, details?: unknown);
}
export declare function isXtrError(error: unknown): error is XtrError;
export declare function fromHttpStatus(status: number, message?: string, details?: unknown): XtrError;
//# sourceMappingURL=errors.d.ts.map