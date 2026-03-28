export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface RequestOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
    signal?: AbortSignal;
}
export interface ApiResponse<T> {
    data: T;
    status: number;
    ok: boolean;
    headers: Record<string, string>;
}
export interface PaginatedResponse<T> {
    results: T[];
    page: number;
    total_pages: number;
    total_results: number;
}
export interface XtrClientConfig {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
}
export interface StreamSource {
    url: string;
    quality: string;
    format: "hls" | "mp4" | "dash" | "webm";
    language?: string;
    subtitles?: SubtitleTrack[];
}
export interface SubtitleTrack {
    url: string;
    language: string;
    label: string;
    format: "vtt" | "srt" | "ass";
}
export interface MediaItem {
    id: string | number;
    title: string;
    type: "movie" | "series" | "episode";
    year?: number;
    poster?: string;
    backdrop?: string;
    overview?: string;
    rating?: number;
    genres?: string[];
    runtime?: number;
}
export interface Movie extends MediaItem {
    type: "movie";
    imdb_id?: string;
}
export interface Series extends MediaItem {
    type: "series";
    seasons?: Season[];
    episodes_count?: number;
    status?: "ongoing" | "ended" | "upcoming";
    imdb_id?: string;
}
export interface Season {
    id: string | number;
    series_id: string | number;
    number: number;
    title?: string;
    episode_count: number;
    air_date?: string;
    poster?: string;
}
export interface Episode {
    id: string | number;
    series_id: string | number;
    season_id: string | number;
    season_number: number;
    episode_number: number;
    title: string;
    overview?: string;
    air_date?: string;
    runtime?: number;
    still?: string;
}
export interface FreemiumPlan {
    id: string;
    name: string;
    features: string[];
    max_streams: number;
    quality_limit: "480p" | "720p" | "1080p" | "4K";
    ads: boolean;
    price?: number;
    currency?: string;
}
export interface UserSession {
    token: string;
    user_id: string;
    email?: string;
    plan: FreemiumPlan;
    expires_at: string;
}
export interface DatabaseRecord {
    id: string | number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
export interface SearchFilters {
    genre?: string;
    year?: number;
    rating_min?: number;
    rating_max?: number;
    type?: "movie" | "series";
    language?: string;
    sort_by?: "popularity" | "rating" | "release_date" | "title";
    order?: "asc" | "desc";
}
export interface SearchQuery {
    q: string;
    page?: number;
    limit?: number;
    filters?: SearchFilters;
}
export interface RouteDefinition {
    path: string;
    method: HttpMethod;
    handler: string;
    middleware?: string[];
    auth?: boolean;
}
export interface MiddlewareContext {
    request: RequestOptions;
    response?: ApiResponse<unknown>;
    next: () => Promise<void>;
    metadata: Record<string, unknown>;
}
export type MiddlewareHandler = (ctx: MiddlewareContext) => Promise<void>;
export interface FlutterPlugin {
    name: string;
    version: string;
    platforms: ("android" | "ios" | "web" | "desktop")[];
    config: Record<string, unknown>;
}
export interface SoftwarePackage {
    id: string;
    name: string;
    version: string;
    description: string;
    download_url: string;
    checksum: string;
    size: number;
    platform: string[];
    dependencies?: Record<string, string>;
}
export interface FrameworkConfig {
    name: string;
    version: string;
    environment: "development" | "staging" | "production";
    features: Record<string, boolean>;
    plugins: string[];
}
export interface XtrErrorShape {
    code: string;
    message: string;
    status?: number;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map