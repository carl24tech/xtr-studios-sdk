import { HttpClient } from "../lib/http";
import { StreamSource, SubtitleTrack } from "../lib/types";
export interface StreamOptions {
    quality?: "480p" | "720p" | "1080p" | "4K";
    format?: "hls" | "mp4" | "dash" | "webm";
    language?: string;
    subtitleLanguage?: string;
}
export interface StreamResult {
    sources: StreamSource[];
    subtitles: SubtitleTrack[];
    preferred: StreamSource | null;
    expires_at: string;
    drm?: DrmConfig;
}
export interface DrmConfig {
    type: "widevine" | "fairplay" | "playready";
    license_url: string;
    certificate_url?: string;
}
export interface MovieStreamRequest {
    id: string | number;
    options?: StreamOptions;
}
export interface SeriesStreamRequest {
    id: string | number;
    season: number;
    episode: number;
    options?: StreamOptions;
}
export interface EpisodeStreamRequest {
    episodeId: string | number;
    options?: StreamOptions;
}
export interface StreamHealth {
    url: string;
    latency: number;
    available: boolean;
    quality: string;
}
export declare class StreamClient {
    private readonly http;
    constructor(http: HttpClient);
    getMovieStream(request: MovieStreamRequest): Promise<StreamResult>;
    getSeriesStream(request: SeriesStreamRequest): Promise<StreamResult>;
    getEpisodeStream(request: EpisodeStreamRequest): Promise<StreamResult>;
    getSources(mediaId: string | number, mediaType: "movie" | "series" | "episode"): Promise<StreamSource[]>;
    getQualities(mediaId: string | number, mediaType: "movie" | "series"): Promise<string[]>;
    checkHealth(sources: StreamSource[]): Promise<StreamHealth[]>;
    selectBestSource(sources: StreamSource[], preferredQuality?: string): StreamSource | null;
    filterByFormat(sources: StreamSource[], format: StreamSource["format"]): StreamSource[];
    filterByLanguage(sources: StreamSource[], language: string): StreamSource[];
    getSubtitlesByLanguage(subtitles: SubtitleTrack[], language: string): SubtitleTrack | undefined;
    private validateStreamResult;
    buildHlsUrl(baseUrl: string, token?: string): string;
    parseManifest(manifestUrl: string): {
        baseUrl: string;
        segments: string[];
    };
}
export declare function createStreamClient(http: HttpClient): StreamClient;
export type { StreamSource, SubtitleTrack };
//# sourceMappingURL=index.d.ts.map