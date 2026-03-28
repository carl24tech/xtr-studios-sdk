"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterClient = void 0;
exports.createFlutterClient = createFlutterClient;
const constants_1 = require("../lib/constants");
class FlutterClient {
    constructor(http) {
        this.http = http;
    }
    async getPlugins(platform) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.flutter.plugins) +
            (platform ? this.http.buildQueryString({ platform }) : "");
        const response = await this.http.get(url);
        return response.data;
    }
    async getConfig(appId) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.flutter.config) +
            this.http.buildQueryString({ app_id: appId });
        const response = await this.http.get(url);
        return response.data;
    }
    async getAssets(version) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.flutter.assets) +
            (version ? this.http.buildQueryString({ version }) : "");
        const response = await this.http.get(url);
        return response.data;
    }
    async getManifest() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.flutter.manifest);
        const response = await this.http.get(url);
        return response.data;
    }
    async updateConfig(appId, config) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.flutter.config);
        const response = await this.http.patch(url, {
            app_id: appId,
            ...config,
        });
        return response.data;
    }
    async getInstallGuide(pluginName) {
        const url = this.http.buildUrl("/api/flutter/plugins/guide") +
            this.http.buildQueryString({ name: pluginName });
        const response = await this.http.get(url);
        return response.data;
    }
    generatePubspecEntry(plugin) {
        return `  ${plugin.name}: ^${plugin.version}`;
    }
    generateInitCode(config) {
        return [
            `XtrStudiosSDK.initialize(`,
            `  apiKey: 'YOUR_API_KEY',`,
            `  baseUrl: '${config.api_base_url}',`,
            `  appId: '${config.app_id}',`,
            `);`,
        ].join("\n");
    }
    getDefaultPlayerConfig() {
        return {
            default_quality: "1080p",
            auto_play: false,
            preload: true,
            pip_enabled: true,
            cast_enabled: true,
            subtitle_default_language: "en",
            skip_intro_seconds: 85,
            skip_credits_seconds: 30,
        };
    }
    getDefaultTheme(darkMode = true) {
        return {
            primary_color: "#E50914",
            accent_color: "#F5F5F1",
            background_color: darkMode ? "#141414" : "#FFFFFF",
            surface_color: darkMode ? "#1F1F1F" : "#F5F5F5",
            text_color: darkMode ? "#FFFFFF" : "#000000",
            dark_mode: darkMode,
        };
    }
    validateConfig(config) {
        const errors = [];
        if (!config.api_base_url)
            errors.push("api_base_url is required");
        if (!config.app_id)
            errors.push("app_id is required");
        if (!config.version)
            errors.push("version is required");
        return errors;
    }
}
exports.FlutterClient = FlutterClient;
function createFlutterClient(http) {
    return new FlutterClient(http);
}
//# sourceMappingURL=index.js.map