"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtrStudiosClient = void 0;
exports.createXtrStudiosClient = createXtrStudiosClient;
const constants_1 = require("../lib/constants");
class XtrStudiosClient {
    constructor(http) {
        this.http = http;
        this.movies = this.createMoviesClient();
    }
    createMoviesClient() {
        const http = this.http;
        const MOVIE_ENDPOINTS = constants_1.ENDPOINTS.movies;
        return {
            async list(options = {}) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.list) +
                    http.buildQueryString(options);
                const response = await http.get(url);
                return response.data;
            },
            async getById(id) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.list) +
                    http.buildQueryString({ id });
                const response = await http.get(url);
                if (response.data.results.length === 0) {
                    throw new Error(`Movie with ID ${id} not found`);
                }
                return response.data.results[0];
            },
            async getPopular(options = {}) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.popular) +
                    http.buildQueryString(options);
                const response = await http.get(url);
                return response.data;
            },
            async getTrending(options = {}) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.trending) +
                    http.buildQueryString(options);
                const response = await http.get(url);
                return response.data;
            },
            async search(query) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.search) +
                    http.buildQueryString({
                        q: query.q,
                        page: query.page,
                        limit: query.limit,
                        ...query.filters,
                    });
                const response = await http.get(url);
                return response.data;
            },
            async getGenres() {
                const url = http.buildUrl(MOVIE_ENDPOINTS.genres);
                const response = await http.get(url);
                return response.data;
            },
            async getByImdbId(imdbId) {
                const url = http.buildUrl(MOVIE_ENDPOINTS.list) +
                    http.buildQueryString({ imdb_id: imdbId });
                const response = await http.get(url);
                if (response.data.results.length === 0) {
                    throw new Error(`Movie with IMDB ID ${imdbId} not found`);
                }
                return response.data.results[0];
            },
        };
    }
    async getInfo() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrstudios.info);
        const response = await this.http.get(url);
        return response.data;
    }
    async getCatalog(page = 1, limit = 20, type) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrstudios.catalog) +
            this.http.buildQueryString({ page, limit, type });
        const response = await this.http.get(url);
        return response.data;
    }
    async getFeatured() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrstudios.featured);
        const response = await this.http.get(url);
        return response.data;
    }
    async getAnnouncements(includeExpired = false) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrstudios.announcements) +
            (includeExpired ? this.http.buildQueryString({ include_expired: true }) : "");
        const response = await this.http.get(url);
        return response.data;
    }
    async search(query) {
        const url = this.http.buildUrl("/api/search") +
            this.http.buildQueryString({
                q: query.q,
                page: query.page,
                limit: query.limit,
                ...query.filters,
            });
        const response = await this.http.get(url);
        return response.data;
    }
    getBaseUrl() {
        return constants_1.BASE_URL;
    }
    async ping() {
        const start = Date.now();
        const url = this.http.buildUrl("/api/ping");
        await this.http.get(url);
        return { pong: true, latency: Date.now() - start };
    }
}
exports.XtrStudiosClient = XtrStudiosClient;
function createXtrStudiosClient(http) {
    return new XtrStudiosClient(http);
}
//# sourceMappingURL=index.js.map