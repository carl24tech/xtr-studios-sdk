"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesClient = void 0;
exports.createSeriesClient = createSeriesClient;
const constants_1 = require("../lib/constants");
const utils_1 = require("../lib/utils");
class SeriesClient {
    constructor(http) {
        this.http = http;
    }
    async list(options = {}) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.list) +
            this.http.buildQueryString(options);
        const response = await this.http.get(url);
        return response.data;
    }
    async getById(id) {
        const path = (0, utils_1.interpolatePath)(constants_1.ENDPOINTS.series.detail, { id });
        const url = this.http.buildUrl(path);
        const response = await this.http.get(url);
        return response.data;
    }
    async getSeasons(id) {
        const path = (0, utils_1.interpolatePath)(constants_1.ENDPOINTS.series.seasons, { id });
        const url = this.http.buildUrl(path);
        const response = await this.http.get(url);
        return response.data;
    }
    async getEpisodes(id, season, options = {}) {
        const path = (0, utils_1.interpolatePath)(constants_1.ENDPOINTS.series.episodes, {
            id,
            season,
        });
        const url = this.http.buildUrl(path) +
            this.http.buildQueryString(options);
        const response = await this.http.get(url);
        return response.data;
    }
    async getPopular(options = {}) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.popular) +
            this.http.buildQueryString(options);
        const response = await this.http.get(url);
        return response.data;
    }
    async getTrending(options = {}) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.trending) +
            this.http.buildQueryString(options);
        const response = await this.http.get(url);
        return response.data;
    }
    async search(query) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.search) +
            this.http.buildQueryString({
                q: query.q,
                page: query.page,
                limit: query.limit,
                ...query.filters,
            });
        const response = await this.http.get(url);
        return response.data;
    }
    async getGenres() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.genres);
        const response = await this.http.get(url);
        return response.data;
    }
    async getSeason(seriesId, seasonNumber) {
        const seasons = await this.getSeasons(seriesId);
        const season = seasons.find((s) => s.number === seasonNumber);
        if (!season) {
            throw new Error(`Season ${seasonNumber} not found for series ${seriesId}`);
        }
        return season;
    }
    async getEpisode(seriesId, seasonNumber, episodeNumber) {
        const episodes = await this.getEpisodes(seriesId, seasonNumber);
        const episode = episodes.results.find((e) => e.episode_number === episodeNumber);
        if (!episode) {
            throw new Error(`Episode ${episodeNumber} not found in season ${seasonNumber} of series ${seriesId}`);
        }
        return episode;
    }
    async getNextEpisode(seriesId, currentSeasonNumber, currentEpisodeNumber) {
        const episodes = await this.getEpisodes(seriesId, currentSeasonNumber);
        const nextInSeason = episodes.results.find((e) => e.episode_number === currentEpisodeNumber + 1);
        if (nextInSeason)
            return nextInSeason;
        const seasons = await this.getSeasons(seriesId);
        const nextSeason = seasons.find((s) => s.number === currentSeasonNumber + 1);
        if (!nextSeason)
            return null;
        const nextSeasonEpisodes = await this.getEpisodes(seriesId, nextSeason.number);
        return nextSeasonEpisodes.results[0] ?? null;
    }
    async getByImdbId(imdbId) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.series.list) +
            this.http.buildQueryString({ imdb_id: imdbId });
        const response = await this.http.get(url);
        if (response.data.results.length === 0) {
            throw new Error(`Series with IMDB ID ${imdbId} not found`);
        }
        return response.data.results[0];
    }
}
exports.SeriesClient = SeriesClient;
function createSeriesClient(http) {
    return new SeriesClient(http);
}
//# sourceMappingURL=index.js.map