"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamClient = void 0;
exports.createStreamClient = createStreamClient;
const constants_1 = require("../lib/constants");
const errors_1 = require("../lib/errors");
class StreamClient {
    constructor(http) {
        this.http = http;
    }
    async getMovieStream(request) {
        if (!request.id) {
            throw new errors_1.XtrStreamError("Movie ID is required");
        }
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.movie) +
            this.http.buildQueryString({
                id: request.id,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
                subtitle_language: request.options?.subtitleLanguage,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getSeriesStream(request) {
        if (!request.id || !request.season || !request.episode) {
            throw new errors_1.XtrStreamError("Series ID, season, and episode are required");
        }
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.series) +
            this.http.buildQueryString({
                id: request.id,
                season: request.season,
                episode: request.episode,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
                subtitle_language: request.options?.subtitleLanguage,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getEpisodeStream(request) {
        if (!request.episodeId) {
            throw new errors_1.XtrStreamError("Episode ID is required");
        }
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.episode) +
            this.http.buildQueryString({
                episode_id: request.episodeId,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
                subtitle_language: request.options?.subtitleLanguage,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getSources(mediaId, mediaType) {
        if (!mediaId || !mediaType) {
            throw new errors_1.XtrStreamError("Media ID and type are required");
        }
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.sources) +
            this.http.buildQueryString({ id: mediaId, type: mediaType });
        const response = await this.http.get(url);
        return response.data || [];
    }
    async getQualities(mediaId, mediaType) {
        if (!mediaId || !mediaType) {
            throw new errors_1.XtrStreamError("Media ID and type are required");
        }
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.qualities) +
            this.http.buildQueryString({ id: mediaId, type: mediaType });
        const response = await this.http.get(url);
        return response.data || [];
    }
    async checkHealth(sources) {
        if (!sources || sources.length === 0) {
            return [];
        }
        const checks = sources.map(async (source) => {
            const start = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const res = await fetch(source.url, {
                    method: "HEAD",
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                return {
                    url: source.url,
                    latency: Date.now() - start,
                    available: res.ok,
                    quality: source.quality,
                };
            }
            catch (error) {
                clearTimeout(timeoutId);
                return {
                    url: source.url,
                    latency: -1,
                    available: false,
                    quality: source.quality,
                };
            }
            finally {
                clearTimeout(timeoutId);
            }
        });
        return Promise.all(checks);
    }
    selectBestSource(sources, preferredQuality) {
        if (!sources || sources.length === 0)
            return null;
        const qualityOrder = ["4K", "1080p", "720p", "480p"];
        if (preferredQuality) {
            const exact = sources.find((s) => s.quality === preferredQuality);
            if (exact)
                return exact;
        }
        for (const quality of qualityOrder) {
            const match = sources.find((s) => s.quality === quality);
            if (match)
                return match;
        }
        return sources[0];
    }
    filterByFormat(sources, format) {
        if (!sources || !format) return [];
        return sources.filter((s) => s.format === format);
    }
    filterByLanguage(sources, language) {
        if (!sources || !language) return [];
        return sources.filter((s) => !s.language || s.language.toLowerCase() === language.toLowerCase());
    }
    getSubtitlesByLanguage(subtitles, language) {
        if (!subtitles || !language) return undefined;
        return subtitles.find((s) => s.language && s.language.toLowerCase() === language.toLowerCase());
    }
    validateStreamResult(response) {
        const result = response.data;
        if (!result) {
            throw new errors_1.XtrStreamError("Invalid response from server");
        }
        if (!result.sources || result.sources.length === 0) {
            throw new errors_1.XtrStreamError("No stream sources returned", result);
        }
        const preferred = this.selectBestSource(result.sources);
        return {
            ...result,
            sources: result.sources,
            subtitles: result.subtitles || [],
            preferred,
            expires_at: result.expires_at || new Date(Date.now() + 3600000).toISOString(),
        };
    }
    buildHlsUrl(baseUrl, token) {
        if (!baseUrl) return "";
        if (!token) return baseUrl;
        const separator = baseUrl.includes("?") ? "&" : "?";
        return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    parseManifest(manifestUrl) {
        if (!manifestUrl) {
            return { baseUrl: "", segments: [] };
        }
        const parts = manifestUrl.split("/");
        const baseUrl = parts.slice(0, -1).join("/");
        return {
            baseUrl,
            segments: [],
        };
    }
}
exports.StreamClient = StreamClient;
function createStreamClient(http) {
    if (!http) {
        throw new errors_1.XtrStreamError("HTTP client is required");
    }
    return new StreamClient(http);
}
