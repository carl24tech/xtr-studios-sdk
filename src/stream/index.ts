import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import { StreamSource, SubtitleTrack, ApiResponse } from "../lib/types";
import { XtrStreamError } from "../lib/errors";

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

export class StreamClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getMovieStream(
    request: MovieStreamRequest
  ): Promise<StreamResult> {
    const url = this.http.buildUrl(ENDPOINTS.stream.movie) +
      this.http.buildQueryString({
        id: request.id,
        quality: request.options?.quality,
        format: request.options?.format,
        language: request.options?.language,
      });

    const response = await this.http.get<StreamResult>(url);
    return this.validateStreamResult(response);
  }

  async getSeriesStream(
    request: SeriesStreamRequest
  ): Promise<StreamResult> {
    const url = this.http.buildUrl(ENDPOINTS.stream.series) +
      this.http.buildQueryString({
        id: request.id,
        season: request.season,
        episode: request.episode,
        quality: request.options?.quality,
        format: request.options?.format,
        language: request.options?.language,
      });

    const response = await this.http.get<StreamResult>(url);
    return this.validateStreamResult(response);
  }

  async getEpisodeStream(
    request: EpisodeStreamRequest
  ): Promise<StreamResult> {
    const url = this.http.buildUrl(ENDPOINTS.stream.episode) +
      this.http.buildQueryString({
        episode_id: request.episodeId,
        quality: request.options?.quality,
        format: request.options?.format,
        language: request.options?.language,
      });

    const response = await this.http.get<StreamResult>(url);
    return this.validateStreamResult(response);
  }

  async getSources(
    mediaId: string | number,
    mediaType: "movie" | "series" | "episode"
  ): Promise<StreamSource[]> {
    const url = this.http.buildUrl(ENDPOINTS.stream.sources) +
      this.http.buildQueryString({ id: mediaId, type: mediaType });

    const response = await this.http.get<StreamSource[]>(url);
    return response.data;
  }

  async getQualities(
    mediaId: string | number,
    mediaType: "movie" | "series"
  ): Promise<string[]> {
    const url = this.http.buildUrl(ENDPOINTS.stream.qualities) +
      this.http.buildQueryString({ id: mediaId, type: mediaType });

    const response = await this.http.get<string[]>(url);
    return response.data;
  }

  async checkHealth(sources: StreamSource[]): Promise<StreamHealth[]> {
    const checks = sources.map(async (source): Promise<StreamHealth> => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5_000);

        const res = await fetch(source.url, {
          method: "HEAD",
          signal: controller.signal,
        });

        return {
          url: source.url,
          latency: Date.now() - start,
          available: res.ok,
          quality: source.quality,
        };
      } catch {
        return {
          url: source.url,
          latency: -1,
          available: false,
          quality: source.quality,
        };
      }
    });

    return Promise.all(checks);
  }

  selectBestSource(
    sources: StreamSource[],
    preferredQuality?: string
  ): StreamSource | null {
    if (sources.length === 0) return null;

    const qualityOrder = ["4K", "1080p", "720p", "480p"];

    if (preferredQuality) {
      const exact = sources.find((s) => s.quality === preferredQuality);
      if (exact) return exact;
    }

    for (const quality of qualityOrder) {
      const match = sources.find((s) => s.quality === quality);
      if (match) return match;
    }

    return sources[0];
  }

  filterByFormat(
    sources: StreamSource[],
    format: StreamSource["format"]
  ): StreamSource[] {
    return sources.filter((s) => s.format === format);
  }

  filterByLanguage(
    sources: StreamSource[],
    language: string
  ): StreamSource[] {
    return sources.filter(
      (s) => !s.language || s.language.toLowerCase() === language.toLowerCase()
    );
  }

  getSubtitlesByLanguage(
    subtitles: SubtitleTrack[],
    language: string
  ): SubtitleTrack | undefined {
    return subtitles.find(
      (s) => s.language.toLowerCase() === language.toLowerCase()
    );
  }

  private validateStreamResult(
    response: ApiResponse<StreamResult>
  ): StreamResult {
    const result = response.data;
    if (!result.sources || result.sources.length === 0) {
      throw new XtrStreamError("No stream sources returned", result);
    }
    return {
      ...result,
      preferred: this.selectBestSource(result.sources),
    };
  }

  buildHlsUrl(baseUrl: string, token?: string): string {
    if (!token) return baseUrl;
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  parseManifest(manifestUrl: string): { baseUrl: string; segments: string[] } {
    const parts = manifestUrl.split("/");
    parts.pop();
    return {
      baseUrl: parts.join("/"),
      segments: [],
    };
  }
}

export function createStreamClient(http: HttpClient): StreamClient {
  return new StreamClient(http);
}

export type { StreamSource, SubtitleTrack };
