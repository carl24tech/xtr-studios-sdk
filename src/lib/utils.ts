import { PaginatedResponse } from "./types";

export function interpolatePath(
  path: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
    path
  );
}

export function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (filtered.length === 0) return "";
  const qs = filtered
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `?${qs}`;
}

export function isEmptyObject(obj: unknown): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.keys(obj as object).length === 0
  );
}

export function paginate<T>(
  results: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    results,
    page,
    total_pages: Math.ceil(total / limit),
    total_results: total,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  return fn().catch((err: unknown) => {
    if (retries <= 0) throw err;
    return sleep(delay).then(() => retry(fn, retries - 1, delay * 2));
  });
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function generateRequestId(): string {
  return `xtr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
