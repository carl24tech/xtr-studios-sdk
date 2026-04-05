import { HttpClient } from "./lib/http";
import { XtrClientConfig } from "./lib/types";
import { StreamClient } from "./stream";
import { SeriesClient } from "./series";
import { DatabaseClient } from "./database";
import { FreemiumClient } from "./freemium";
import { FlutterClient } from "./flutter";
import { FrameworkClient } from "./framework";
import { XtrStudiosClient } from "./xtrstudios";
import { XtrSoftwaresClient } from "./xtrsoftwares";
import { Router } from "./routes";
import { MiddlewarePipeline } from "./middleware";

export declare class XtrStudiosSDK {
    private readonly http;
    readonly stream: StreamClient;
    readonly series: SeriesClient;
    readonly database: DatabaseClient;
    readonly freemium: FreemiumClient;
    readonly flutter: FlutterClient;
    readonly framework: FrameworkClient;
    readonly xtrstudios: XtrStudiosClient;
    readonly xtrsoftwares: XtrSoftwaresClient;
    readonly router: Router;
    readonly middleware: MiddlewarePipeline;
    constructor(config?: XtrClientConfig);
    setApiKey(apiKey: string): void;
    setHeader(key: string, value: string): void;
    removeHeader(key: string): void;
    getBaseUrl(): string;
    getHttpClient(): HttpClient;
}

export declare function createClient(config?: XtrClientConfig): XtrStudiosSDK;

export { BASE_URL } from "./lib/constants";
export * from "./lib/types";
export * from "./lib/errors";
export * from "./lib/constants";
export * from "./lib/utils";
export * from "./lib/http";
export * from "./stream";
export * from "./series";
export * from "./database";
export * from "./freemium";
export * from "./flutter";
export * from "./framework";
export * from "./xtrstudios";
export * from "./xtrsoftwares";
export * from "./routes";
export * from "./middleware";

export default XtrStudiosSDK;
