import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import { StreamSource, SubtitleTrack, ApiResponse } from "../lib/types";
import { XtrStreamError } from "../lib/errors";

export interface StreamOptions {
  quality?: "480p" | "720p" | "1080p" | "4K";
  format?: "hls" | "mp4" | "dash" | "webm";
  language?: string;
  subtitleLanguage?: string;
  drm_enabled?: boolean;
  adaptive_bitrate?: boolean;
}

export interface StreamResult {
  sources: StreamSource[];
  subtitles: SubtitleTrack[];
  preferred: StreamSource | null;
  expires_at: string;
  drm?: DrmConfig;
  metadata?: {
    duration?: number;
    title?: string;
    season?: number;
    episode?: number;
  };
}

export interface DrmConfig {
  type: "widevine" | "fairplay" | "playready";
  license_url: string;
  certificate_url?: string;
  headers?: Record<string, string>;
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
  statusCode?: number;
  errorMessage?: string;
}

export interface StreamValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class StreamClient {
  private readonly http: HttpClient;
  private healthCheckTimeout: number = 5000;
  private defaultQuality: StreamOptions["quality"] = "1080p";

  constructor(http: HttpClient) {
    if (!http) {
      throw new Error("HttpClient is required to initialize StreamClient");
    }
    this.http = http;
  }

  async getMovieStream(request: MovieStreamRequest): Promise<StreamResult> {
    this.validateMediaId(request.id);
    
    try {
      const url = this.http.buildUrl(ENDPOINTS.stream.movie, {
        id: request.id,
        ...this.sanitizeOptions(request.options),
      });

      const response = await this.http.get<StreamResult>(url);
      return this.validateStreamResult(response, "movie", request.id);
    } catch (error) {
      console.error(`Failed to get movie stream for ID ${request.id}:`, error);
      throw this.wrapError(error, `Unable to fetch stream for movie ${request.id}`);
    }
  }

  async getSeriesStream(request: SeriesStreamRequest): Promise<StreamResult> {
    this.validateMediaId(request.id);
    this.validateSeasonEpisode(request.season, request.episode);
    
    try {
      const url = this.http.buildUrl(ENDPOINTS.stream.series, {
        id: request.id,
        season: request.season,
        episode: request.episode,
        ...this.sanitizeOptions(request.options),
      });

      const response = await this.http.get<StreamResult>(url);
      return this.validateStreamResult(response, "series", `${request.id}-s${request.season}e${request.episode}`);
    } catch (error) {
      console.error(`Failed to get series stream for ID ${request.id}, S${request.season}E${request.episode}:`, error);
      throw this.wrapError(error, `Unable to fetch stream for series episode`);
    }
  }

  async getEpisodeStream(request: EpisodeStreamRequest): Promise<StreamResult> {
    this.validateMediaId(request.episodeId);
    
    try {
      const url = this.http.buildUrl(ENDPOINTS.stream.episode, {
        episode_id: request.episodeId,
        ...this.sanitizeOptions(request.options),
      });

      const response = await this.http.get<StreamResult>(url);
      return this.validateStreamResult(response, "episode", request.episodeId);
    } catch (error) {
      console.error(`Failed to get episode stream for ID ${request.episodeId}:`, error);
      throw this.wrapError(error, `Unable to fetch stream for episode ${request.episodeId}`);
    }
  }

  async getSources(
    mediaId: string | number,
    mediaType: "movie" | "series" | "episode"
  ): Promise<StreamSource[]> {
    this.validateMediaId(mediaId);
    
    if (!["movie", "series", "episode"].includes(mediaType)) {
      throw new Error(`Invalid media type: ${mediaType}. Must be 'movie', 'series', or 'episode'`);
    }
    
    try {
      const url = this.http.buildUrl(ENDPOINTS.stream.sources, {
        id: mediaId,
        type: mediaType,
      });

      const response = await this.http.get<StreamSource[]>(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format: expected array of sources");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Failed to get sources for ${mediaType} ${mediaId}:`, error);
      throw this.wrapError(error, `Unable to retrieve stream sources`);
    }
  }

  async getQualities(
    mediaId: string | number,
    mediaType: "movie" | "series"
  ): Promise<string[]> {
    this.validateMediaId(mediaId);
    
    try {
      const url = this.http.buildUrl(ENDPOINTS.stream.qualities, {
        id: mediaId,
        type: mediaType,
      });

      const response = await this.http.get<string[]>(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format: expected array of qualities");
      }
      
      return response.data.sort((a, b) => {
        const qualityOrder = ["4K", "1080p", "720p", "480p"];
        return qualityOrder.indexOf(a) - qualityOrder.indexOf(b);
      });
    } catch (error) {
      console.error(`Failed to get qualities for ${mediaType} ${mediaId}:`, error);
      throw this.wrapError(error, `Unable to retrieve available qualities`);
    }
  }

  async checkHealth(sources: StreamSource[]): Promise<StreamHealth[]> {
    if (!sources || sources.length === 0) {
      return [];
    }
    
    const checks = sources.map(async (source): Promise<StreamHealth> => {
      const start = Date.now();
      let statusCode: number | undefined;
      let errorMessage: string | undefined;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.healthCheckTimeout);

        const res = await fetch(source.url, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "Accept": "*/*",
          },
        });

        clearTimeout(timeoutId);
        statusCode = res.status;

        return {
          url: source.url,
          latency: Date.now() - start,
          available: res.ok,
          quality: source.quality,
          statusCode,
        };
      } catch (error) {
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        return {
          url: source.url,
          latency: -1,
          available: false,
          quality: source.quality,
          statusCode,
          errorMessage,
        };
      }
    });

    return Promise.all(checks);
  }

  selectBestSource(
    sources: StreamSource[],
    preferredQuality?: string,
    preferredFormat?: string
  ): StreamSource | null {
    if (!sources || sources.length === 0) return null;
    
    // Filter out invalid sources
    const validSources = sources.filter(s => s && s.url && s.quality);
    if (validSources.length === 0) return null;

    const qualityOrder = ["4K", "1080p", "720p", "480p"];
    
    // Try exact match with quality and format
    if (preferredQuality && preferredFormat) {
      const exact = validSources.find(
        (s) => s.quality === preferredQuality && s.format === preferredFormat
      );
      if (exact) return exact;
    }
    
    // Try quality match
    if (preferredQuality) {
      const qualityMatch = validSources.find((s) => s.quality === preferredQuality);
      if (qualityMatch) return qualityMatch;
    }
    
    // Try format match
    if (preferredFormat) {
      const formatMatch = validSources.find((s) => s.format === preferredFormat);
      if (formatMatch) return formatMatch;
    }
    
    // Try best quality available
    for (const quality of qualityOrder) {
      const match = validSources.find((s) => s.quality === quality);
      if (match) return match;
    }
    
    // Fallback to first source
    return validSources[0];
  }

  filterByFormat(
    sources: StreamSource[],
    format: StreamSource["format"]
  ): StreamSource[] {
    if (!sources || !format) return [];
    return sources.filter((s) => s && s.format === format);
  }

  filterByLanguage(
    sources: StreamSource[],
    language: string
  ): StreamSource[] {
    if (!sources || !language) return sources || [];
    return sources.filter(
      (s) => !s.language || s.language.toLowerCase() === language.toLowerCase()
    );
  }

  getSubtitlesByLanguage(
    subtitles: SubtitleTrack[],
    language: string
  ): SubtitleTrack | undefined {
    if (!subtitles || !language) return undefined;
    
    // Try exact match
    let match = subtitles.find(
      (s) => s.language.toLowerCase() === language.toLowerCase()
    );
    
    // Try partial match (e.g., "en-US" matches "en")
    if (!match && language.includes("-")) {
      const baseLanguage = language.split("-")[0];
      match = subtitles.find(
        (s) => s.language.toLowerCase().startsWith(baseLanguage.toLowerCase())
      );
    }
    
    return match;
  }

  async validateStream(request: MovieStreamRequest | SeriesStreamRequest | EpisodeStreamRequest): Promise<StreamValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      let streamResult: StreamResult;
      
      if ("season" in request) {
        streamResult = await this.getSeriesStream(request);
      } else if ("episodeId" in request) {
        streamResult = await this.getEpisodeStream(request);
      } else {
        streamResult = await this.getMovieStream(request);
      }
      
      // Check expiration
      const expiresAt = new Date(streamResult.expires_at);
      if (expiresAt < new Date()) {
        errors.push("Stream URL has expired");
      } else if (expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
        warnings.push("Stream URL will expire in less than 5 minutes");
      }
      
      // Check sources
      if (!streamResult.sources || streamResult.sources.length === 0) {
        errors.push("No stream sources available");
      }
      
      // Check DRM if required
      if (request.options?.drm_enabled && !streamResult.drm) {
        warnings.push("DRM requested but not available for this stream");
      }
      
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Stream validation failed");
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  setHealthCheckTimeout(timeoutMs: number): void {
    if (timeoutMs < 1000) {
      throw new Error("Health check timeout must be at least 1000ms");
    }
    this.healthCheckTimeout = timeoutMs;
  }

  setDefaultQuality(quality: StreamOptions["quality"]): void {
    const validQualities = ["480p", "720p", "1080p", "4K"];
    if (!validQualities.includes(quality)) {
      throw new Error(`Invalid quality. Must be one of: ${validQualities.join(", ")}`);
    }
    this.defaultQuality = quality;
  }

  buildHlsUrl(baseUrl: string, token?: string, extraParams?: Record<string, string>): string {
    if (!baseUrl) throw new Error("Base URL is required");
    
    let url = baseUrl;
    
    if (token) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}token=${encodeURIComponent(token)}`;
    }
    
    if (extraParams) {
      const separator = url.includes("?") ? "&" : "?";
      const params = new URLSearchParams(extraParams).toString();
      url = `${url}${separator}${params}`;
    }
    
    return url;
  }

  parseManifest(manifestUrl: string): { baseUrl: string; segments: string[]; isMaster: boolean } {
    if (!manifestUrl) {
      throw new Error("Manifest URL is required");
    }
    
    const parts = manifestUrl.split("/");
    const filename = parts.pop() || "";
    const isMaster = filename.includes("master") || filename.includes("index");
    
    return {
      baseUrl: parts.join("/"),
      segments: [],
      isMaster,
    };
  }

  private validateStreamResult(
    response: ApiResponse<StreamResult>,
    mediaType: string,
    mediaId: string | number
  ): StreamResult {
    if (!response.data) {
      throw new XtrStreamError(`Empty response for ${mediaType} ${mediaId}`, response);
    }
    
    const result = response.data;
    
    if (!result.sources || result.sources.length === 0) {
      throw new XtrStreamError(`No stream sources returned for ${mediaType} ${mediaId}`, result);
    }
    
    // Validate each source has required fields
    result.sources.forEach((source, index) => {
      if (!source.url) {
        throw new XtrStreamError(`Source ${index} missing URL`, source);
      }
      if (!source.quality) {
        console.warn(`Source ${index} missing quality, defaulting to "720p"`);
        source.quality = "720p";
      }
    });
    
    const preferredQuality = this.defaultQuality;
    
    return {
      ...result,
      preferred: this.selectBestSource(result.sources, preferredQuality),
    };
  }

  private sanitizeOptions(options?: StreamOptions): Partial<StreamOptions> {
    if (!options) return {};
    
    const sanitized: Partial<StreamOptions> = {};
    
    if (options.quality && ["480p", "720p", "1080p", "4K"].includes(options.quality)) {
      sanitized.quality = options.quality;
    }
    
    if (options.format && ["hls", "mp4", "dash", "webm"].includes(options.format)) {
      sanitized.format = options.format;
    }
    
    if (options.language && options.language.trim()) {
      sanitized.language = options.language.trim().toLowerCase();
    }
    
    if (options.subtitleLanguage && options.subtitleLanguage.trim()) {
      sanitized.subtitleLanguage = options.subtitleLanguage.trim().toLowerCase();
    }
    
    if (options.drm_enabled !== undefined) {
      sanitized.drm_enabled = options.drm_enabled;
    }
    
    if (options.adaptive_bitrate !== undefined) {
      sanitized.adaptive_bitrate = options.adaptive_bitrate;
    }
    
    return sanitized;
  }

  private validateMediaId(id: string | number): void {
    if (id === undefined || id === null || id === "") {
      throw new Error("Media ID is required");
    }
    
    if (typeof id === "number" && isNaN(id)) {
      throw new Error("Media ID cannot be NaN");
    }
    
    if (typeof id === "string" && id.trim() === "") {
      throw new Error("Media ID cannot be empty string");
    }
  }

  private validateSeasonEpisode(season: number, episode: number): void {
    if (season === undefined || season === null || season < 1) {
      throw new Error("Season number must be a positive integer");
    }
    
    if (episode === undefined || episode === null || episode < 1) {
      throw new Error("Episode number must be a positive integer");
    }
  }

  private wrapError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof XtrStreamError) {
      return error;
    }
    if (error instanceof Error) {
      return new XtrStreamError(`${fallbackMessage}: ${error.message}`, error);
    }
    return new XtrStreamError(fallbackMessage, error);
  }
}

export function createStreamClient(http: HttpClient): StreamClient {
  if (!http) {
    throw new Error("HttpClient is required to create StreamClient");
  }
  return new StreamClient(http);
}

export type { StreamSource, SubtitleTrack };
