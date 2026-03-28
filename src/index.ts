import { HttpClient } from "./lib/http";
import { XtrClientConfig } from "./lib/types";
import { BASE_URL } from "./lib/constants";

import { StreamClient, createStreamClient } from "./stream";
import { SeriesClient, createSeriesClient } from "./series";
import { DatabaseClient, createDatabaseClient } from "./database";
import { FreemiumClient, createFreemiumClient } from "./freemium";
import { FlutterClient, createFlutterClient } from "./flutter";
import { FrameworkClient, createFrameworkClient } from "./framework";
import { XtrStudiosClient, createXtrStudiosClient } from "./xtrstudios";
import { XtrSoftwaresClient, createXtrSoftwaresClient } from "./xtrsoftwares";
import { Router, defaultRoutes } from "./routes";
import { MiddlewarePipeline } from "./middleware";

export class XtrStudiosSDK {
  private readonly http: HttpClient;

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

  constructor(config: XtrClientConfig = {}) {
    this.http = new HttpClient({
      baseUrl: BASE_URL,
      ...config,
    });

    this.stream = createStreamClient(this.http);
    this.series = createSeriesClient(this.http);
    this.database = createDatabaseClient(this.http);
    this.freemium = createFreemiumClient(this.http);
    this.flutter = createFlutterClient(this.http);
    this.framework = createFrameworkClient(this.http);
    this.xtrstudios = createXtrStudiosClient(this.http);
    this.xtrsoftwares = createXtrSoftwaresClient(this.http);
    this.router = defaultRoutes(this.http);
    this.middleware = new MiddlewarePipeline();
  }

  setApiKey(apiKey: string): void {
    this.http.setApiKey(apiKey);
  }

  setHeader(key: string, value: string): void {
    this.http.setHeader(key, value);
  }

  removeHeader(key: string): void {
    this.http.removeHeader(key);
  }

  getBaseUrl(): string {
    return this.http.getBaseUrl();
  }

  getHttpClient(): HttpClient {
    return this.http;
  }
}

export function createClient(config?: XtrClientConfig): XtrStudiosSDK {
  return new XtrStudiosSDK(config);
}

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
