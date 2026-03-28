export declare const BASE_URL = "https://www.xtrstudios.site";
export declare const API_VERSION = "v1";
export declare const DEFAULT_TIMEOUT = 30000;
export declare const DEFAULT_RETRIES = 3;
export declare const DEFAULT_RETRY_DELAY = 1000;
export declare const SDK_VERSION = "1.0.0";
export declare const SDK_USER_AGENT = "XtrStudios-SDK/1.0.0 (TypeScript)";
export declare const ENDPOINTS: {
    readonly stream: {
        readonly movie: "/api/stream/movie";
        readonly series: "/api/stream/series";
        readonly episode: "/api/stream/episode";
        readonly sources: "/api/stream/sources";
        readonly qualities: "/api/stream/qualities";
    };
    readonly movies: {
        readonly list: "/api/movies";
        readonly detail: "/api/movies/:id";
        readonly popular: "/api/movies/popular";
        readonly trending: "/api/movies/trending";
        readonly search: "/api/movies/search";
        readonly genres: "/api/movies/genres";
    };
    readonly series: {
        readonly list: "/api/series";
        readonly detail: "/api/series/:id";
        readonly seasons: "/api/series/:id/seasons";
        readonly episodes: "/api/series/:id/seasons/:season/episodes";
        readonly popular: "/api/series/popular";
        readonly trending: "/api/series/trending";
        readonly search: "/api/series/search";
        readonly genres: "/api/series/genres";
    };
    readonly freemium: {
        readonly plans: "/api/freemium/plans";
        readonly subscribe: "/api/freemium/subscribe";
        readonly cancel: "/api/freemium/cancel";
        readonly upgrade: "/api/freemium/upgrade";
        readonly status: "/api/freemium/status";
    };
    readonly auth: {
        readonly login: "/api/auth/login";
        readonly register: "/api/auth/register";
        readonly logout: "/api/auth/logout";
        readonly refresh: "/api/auth/refresh";
        readonly me: "/api/auth/me";
    };
    readonly database: {
        readonly query: "/api/db/query";
        readonly insert: "/api/db/insert";
        readonly update: "/api/db/update";
        readonly delete: "/api/db/delete";
        readonly batch: "/api/db/batch";
    };
    readonly flutter: {
        readonly plugins: "/api/flutter/plugins";
        readonly config: "/api/flutter/config";
        readonly assets: "/api/flutter/assets";
        readonly manifest: "/api/flutter/manifest";
    };
    readonly framework: {
        readonly config: "/api/framework/config";
        readonly features: "/api/framework/features";
        readonly health: "/api/framework/health";
        readonly version: "/api/framework/version";
    };
    readonly xtrstudios: {
        readonly info: "/api/xtrstudios/info";
        readonly catalog: "/api/xtrstudios/catalog";
        readonly featured: "/api/xtrstudios/featured";
        readonly announcements: "/api/xtrstudios/announcements";
    };
    readonly xtrsoftwares: {
        readonly packages: "/api/xtrsoftwares/packages";
        readonly download: "/api/xtrsoftwares/download/:id";
        readonly changelog: "/api/xtrsoftwares/changelog/:id";
        readonly latest: "/api/xtrsoftwares/latest";
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly RATE_LIMITED: 429;
    readonly SERVER_ERROR: 500;
};
export declare const MEDIA_FORMATS: {
    readonly HLS: "hls";
    readonly MP4: "mp4";
    readonly DASH: "dash";
    readonly WEBM: "webm";
};
export declare const QUALITY_LEVELS: {
    readonly SD: "480p";
    readonly HD: "720p";
    readonly FHD: "1080p";
    readonly UHD: "4K";
};
//# sourceMappingURL=constants.d.ts.map