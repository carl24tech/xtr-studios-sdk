import { PaginatedResponse } from "./types";

export declare function interpolatePath(path: string, params: Record<string, string | number>): string;

export declare function buildQueryString(params: Record<string, unknown>): string;

export declare function isEmptyObject(obj: Record<string, unknown>): boolean;

export declare function paginate<T>(results: T[], page: number, limit: number, total: number): PaginatedResponse<T>;

export declare function sleep(ms: number): Promise<void>;

export declare function chunk<T>(array: T[], size: number): T[][];

export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;

export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;

export declare function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void;

export declare function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T>;

export declare function formatBytes(bytes: number, decimals?: number): string;

export declare function generateRequestId(): string;
