export declare const BASE_URL = "https://www.xtrstudios.site";
export declare const API_VERSION = "v1";
export declare const DEFAULT_TIMEOUT = 30000;
export declare const DEFAULT_RETRIES = 3;
export declare const DEFAULT_RETRY_DELAY = 1000;
export declare const SDK_VERSION = "1.0.0";
export declare const SDK_USER_AGENT = "XtrStudios-SDK/1.0.0 (TypeScript)";

export declare const ENDPOINTS: {
    readonly stream: {
        readonly movie: string;
        readonly series: string;
        readonly episode: string;
        readonly sources: string;
        readonly qualities: string;
    };
    readonly movies: {
        readonly list: string;
        readonly detail: string;
        readonly popular: string;
        readonly trending: string;
        readonly search: string;
        readonly genres: string;
    };
    readonly series: {
        readonly list: string;
        readonly detail: string;
        readonly seasons: string;
        readonly episodes: string;
        readonly popular: string;
        readonly trending: string;
        readonly search: string;
        readonly genres: string;
    };
    readonly freemium: {
        readonly plans: string;
        readonly subscribe: string;
        readonly cancel: string;
        readonly upgrade: string;
        readonly status: string;
    };
    readonly auth: {
        readonly login: string;
        readonly register: string;
        readonly logout: string;
        readonly refresh: string;
        readonly me: string;
    };
    readonly database: {
        readonly query: string;
        readonly insert: string;
        readonly update: string;
        readonly delete: string;
        readonly batch: string;
    };
    readonly flutter: {
        readonly plugins: string;
        readonly config: string;
        readonly assets: string;
        readonly manifest: string;
    };
    readonly framework: {
        readonly config: string;
        readonly features: string;
        readonly health: string;
        readonly version: string;
    };
    readonly xtrstudios: {
        readonly info: string;
        readonly catalog: string;
        readonly featured: string;
        readonly announcements: string;
    };
    readonly xtrsoftwares: {
        readonly packages: string;
        readonly download: string;
        readonly changelog: string;
        readonly latest: string;
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

export declare const STREAM_QUALITIES: readonly ["480p", "720p", "1080p", "4K"];
export declare const STREAM_FORMATS: readonly ["hls", "mp4", "dash", "webm"];

export type StreamQuality = typeof STREAM_QUALITIES[number];
export type StreamFormat = typeof STREAM_FORMATS[number];

export declare const ERROR_CODES: {
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
    readonly AUTH_ERROR: "AUTH_ERROR";
    readonly RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR";
    readonly SERVER_ERROR: "SERVER_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
};

export declare const CACHE_KEYS: {
    readonly MOVIES_LIST: "movies_list";
    readonly SERIES_LIST: "series_list";
    readonly GENRES: "genres";
    readonly USER_PROFILE: "user_profile";
    readonly STREAM_SOURCES: "stream_sources";
};

export declare const DEFAULT_HEADERS: {
    readonly "Content-Type": "application/json";
    readonly Accept: "application/json";
};

export { MEDIA_FORMATS, QUALITY_LEVELS };
