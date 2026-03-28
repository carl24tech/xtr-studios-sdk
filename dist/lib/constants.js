"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUALITY_LEVELS = exports.MEDIA_FORMATS = exports.HTTP_STATUS = exports.ENDPOINTS = exports.SDK_USER_AGENT = exports.SDK_VERSION = exports.DEFAULT_RETRY_DELAY = exports.DEFAULT_RETRIES = exports.DEFAULT_TIMEOUT = exports.API_VERSION = exports.BASE_URL = void 0;
exports.BASE_URL = "https://www.xtrstudios.site";
exports.API_VERSION = "v1";
exports.DEFAULT_TIMEOUT = 30000;
exports.DEFAULT_RETRIES = 3;
exports.DEFAULT_RETRY_DELAY = 1000;
exports.SDK_VERSION = "1.0.0";
exports.SDK_USER_AGENT = `XtrStudios-SDK/${exports.SDK_VERSION} (TypeScript)`;
exports.ENDPOINTS = {
    stream: {
        movie: "/api/stream/movie",
        series: "/api/stream/series",
        episode: "/api/stream/episode",
        sources: "/api/stream/sources",
        qualities: "/api/stream/qualities",
    },
    movies: {
        list: "/api/movies",
        detail: "/api/movies/:id",
        popular: "/api/movies/popular",
        trending: "/api/movies/trending",
        search: "/api/movies/search",
        genres: "/api/movies/genres",
    },
    series: {
        list: "/api/series",
        detail: "/api/series/:id",
        seasons: "/api/series/:id/seasons",
        episodes: "/api/series/:id/seasons/:season/episodes",
        popular: "/api/series/popular",
        trending: "/api/series/trending",
        search: "/api/series/search",
        genres: "/api/series/genres",
    },
    freemium: {
        plans: "/api/freemium/plans",
        subscribe: "/api/freemium/subscribe",
        cancel: "/api/freemium/cancel",
        upgrade: "/api/freemium/upgrade",
        status: "/api/freemium/status",
    },
    auth: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        logout: "/api/auth/logout",
        refresh: "/api/auth/refresh",
        me: "/api/auth/me",
    },
    database: {
        query: "/api/db/query",
        insert: "/api/db/insert",
        update: "/api/db/update",
        delete: "/api/db/delete",
        batch: "/api/db/batch",
    },
    flutter: {
        plugins: "/api/flutter/plugins",
        config: "/api/flutter/config",
        assets: "/api/flutter/assets",
        manifest: "/api/flutter/manifest",
    },
    framework: {
        config: "/api/framework/config",
        features: "/api/framework/features",
        health: "/api/framework/health",
        version: "/api/framework/version",
    },
    xtrstudios: {
        info: "/api/xtrstudios/info",
        catalog: "/api/xtrstudios/catalog",
        featured: "/api/xtrstudios/featured",
        announcements: "/api/xtrstudios/announcements",
    },
    xtrsoftwares: {
        packages: "/api/xtrsoftwares/packages",
        download: "/api/xtrsoftwares/download/:id",
        changelog: "/api/xtrsoftwares/changelog/:id",
        latest: "/api/xtrsoftwares/latest",
    },
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500,
};
exports.MEDIA_FORMATS = {
    HLS: "hls",
    MP4: "mp4",
    DASH: "dash",
    WEBM: "webm",
};
exports.QUALITY_LEVELS = {
    SD: "480p",
    HD: "720p",
    FHD: "1080p",
    UHD: "4K",
};
//# sourceMappingURL=constants.js.map