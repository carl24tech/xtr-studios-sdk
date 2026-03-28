"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_URL = exports.XtrStudiosSDK = void 0;
exports.createClient = createClient;
const http_1 = require("./lib/http");
const constants_1 = require("./lib/constants");
const stream_1 = require("./stream");
const series_1 = require("./series");
const database_1 = require("./database");
const freemium_1 = require("./freemium");
const flutter_1 = require("./flutter");
const framework_1 = require("./framework");
const xtrstudios_1 = require("./xtrstudios");
const xtrsoftwares_1 = require("./xtrsoftwares");
const routes_1 = require("./routes");
const middleware_1 = require("./middleware");
class XtrStudiosSDK {
    constructor(config = {}) {
        this.http = new http_1.HttpClient({
            baseUrl: constants_1.BASE_URL,
            ...config,
        });
        this.stream = (0, stream_1.createStreamClient)(this.http);
        this.series = (0, series_1.createSeriesClient)(this.http);
        this.database = (0, database_1.createDatabaseClient)(this.http);
        this.freemium = (0, freemium_1.createFreemiumClient)(this.http);
        this.flutter = (0, flutter_1.createFlutterClient)(this.http);
        this.framework = (0, framework_1.createFrameworkClient)(this.http);
        this.xtrstudios = (0, xtrstudios_1.createXtrStudiosClient)(this.http);
        this.xtrsoftwares = (0, xtrsoftwares_1.createXtrSoftwaresClient)(this.http);
        this.router = (0, routes_1.defaultRoutes)(this.http);
        this.middleware = new middleware_1.MiddlewarePipeline();
    }
    setApiKey(apiKey) {
        this.http.setApiKey(apiKey);
    }
    setHeader(key, value) {
        this.http.setHeader(key, value);
    }
    removeHeader(key) {
        this.http.removeHeader(key);
    }
    getBaseUrl() {
        return this.http.getBaseUrl();
    }
    getHttpClient() {
        return this.http;
    }
}
exports.XtrStudiosSDK = XtrStudiosSDK;
function createClient(config) {
    return new XtrStudiosSDK(config);
}
var constants_2 = require("./lib/constants");
Object.defineProperty(exports, "BASE_URL", { enumerable: true, get: function () { return constants_2.BASE_URL; } });
__exportStar(require("./lib/types"), exports);
__exportStar(require("./lib/errors"), exports);
__exportStar(require("./lib/constants"), exports);
__exportStar(require("./lib/utils"), exports);
__exportStar(require("./lib/http"), exports);
__exportStar(require("./stream"), exports);
__exportStar(require("./series"), exports);
__exportStar(require("./database"), exports);
__exportStar(require("./freemium"), exports);
__exportStar(require("./flutter"), exports);
__exportStar(require("./framework"), exports);
__exportStar(require("./xtrstudios"), exports);
__exportStar(require("./xtrsoftwares"), exports);
__exportStar(require("./routes"), exports);
__exportStar(require("./middleware"), exports);
exports.default = XtrStudiosSDK;
//# sourceMappingURL=index.js.map