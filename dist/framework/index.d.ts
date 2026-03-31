"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkClient = void 0;
exports.createFrameworkClient = createFrameworkClient;
const constants_1 = require("../lib/constants");

class FrameworkClient {
    constructor(http) {
        this.cachedConfig = null;
        this.cachedFeatures = null;
        this.http = http;
    }

    async getConfig() {
        if (this.cachedConfig) return this.cachedConfig;
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.config);
        const response = await this.http.get(url);
        this.cachedConfig = response.data;
        return response.data;
    }

    async refreshConfig() {
        this.cachedConfig = null;
        return this.getConfig();
    }

    async getFeatures() {
        if (this.cachedFeatures) return this.cachedFeatures;
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.features);
        const response = await this.http.get(url);
        this.cachedFeatures = response.data;
        return response.data;
    }

    async isFeatureEnabled(featureName) {
        const features = await this.getFeatures();
        return features?.features?.[featureName] ?? false;
    }

    async getExperimentValue(experimentName) {
        const features = await this.getFeatures();
        return features?.experiments?.[experimentName];
    }

    async getRolloutPercentage(rolloutName) {
        const features = await this.getFeatures();
        return features?.rollouts?.[rolloutName] ?? 0;
    }

    async checkHealth() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.health);
        const response = await this.http.get(url);
        return response.data;
    }

    async isHealthy() {
        const health = await this.checkHealth();
        return health?.status === "healthy";
    }

    async getVersion() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.version);
        const response = await this.http.get(url);
        return response.data;
    }

    async checkForUpdates() {
        const versionInfo = await this.getVersion();
        const hasUpdate = versionInfo?.latest_release !== constants_1.SDK_VERSION;
        return {
            hasUpdate,
            current: constants_1.SDK_VERSION,
            latest: versionInfo?.latest_release ?? constants_1.SDK_VERSION,
        };
    }

    async getEnvironment() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.environment);
        const response = await this.http.get(url);
        return response.data;
    }

    async getPlugins() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.framework.plugins);
        const response = await this.http.get(url);
        return response.data;
    }

    async enablePlugin(pluginId) {
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.framework.plugins}/${pluginId}/enable`);
        const response = await this.http.post(url);
        return response.data;
    }

    async disablePlugin(pluginId) {
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.framework.plugins}/${pluginId}/disable`);
        const response = await this.http.post(url);
        return response.data;
    }

    clearCache() {
        this.cachedConfig = null;
        this.cachedFeatures = null;
    }
}
exports.FrameworkClient = FrameworkClient;

function createFrameworkClient(http) {
    return new FrameworkClient(http);
}
