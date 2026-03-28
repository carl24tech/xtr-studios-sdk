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
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.movie) +
            this.http.buildQueryString({
                id: request.id,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getSeriesStream(request) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.series) +
            this.http.buildQueryString({
                id: request.id,
                season: request.season,
                episode: request.episode,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getEpisodeStream(request) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.episode) +
            this.http.buildQueryString({
                episode_id: request.episodeId,
                quality: request.options?.quality,
                format: request.options?.format,
                language: request.options?.language,
            });
        const response = await this.http.get(url);
        return this.validateStreamResult(response);
    }
    async getSources(mediaId, mediaType) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.sources) +
            this.http.buildQueryString({ id: mediaId, type: mediaType });
        const response = await this.http.get(url);
        return response.data;
    }
    async getQualities(mediaId, mediaType) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.stream.qualities) +
            this.http.buildQueryString({ id: mediaId, type: mediaType });
        const response = await this.http.get(url);
        return response.data;
    }
    async checkHealth(sources) {
        const checks = sources.map(async (source) => {
            const start = Date.now();
            try {
                const controller = new AbortController();
                setTimeout(() => controller.abort(), 5000);
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
            }
            catch {
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
    selectBestSource(sources, preferredQuality) {
        if (sources.length === 0)
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
        return sources.filter((s) => s.format === format);
    }
    filterByLanguage(sources, language) {
        return sources.filter((s) => !s.language || s.language.toLowerCase() === language.toLowerCase());
    }
    getSubtitlesByLanguage(subtitles, language) {
        return subtitles.find((s) => s.language.toLowerCase() === language.toLowerCase());
    }
    validateStreamResult(response) {
        const result = response.data;
        if (!result.sources || result.sources.length === 0) {
            throw new errors_1.XtrStreamError("No stream sources returned", result);
        }
        return {
            ...result,
            preferred: this.selectBestSource(result.sources),
        };
    }
    buildHlsUrl(baseUrl, token) {
        if (!token)
            return baseUrl;
        const separator = baseUrl.includes("?") ? "&" : "?";
        return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    parseManifest(manifestUrl) {
        const parts = manifestUrl.split("/");
        parts.pop();
        return {
            baseUrl: parts.join("/"),
            segments: [],
        };
    }
}
exports.StreamClient = StreamClient;
function createStreamClient(http) {
    return new StreamClient(http);
}
//# sourceMappingURL=index.js.map