import { HttpClient } from "../lib/http";
import { FrameworkConfig } from "../lib/types";
export interface HealthStatus {
    status: "healthy" | "degraded" | "down";
    version: string;
    uptime: number;
    services: Record<string, ServiceHealth>;
    timestamp: string;
}
export interface ServiceHealth {
    status: "up" | "down" | "degraded";
    latency_ms?: number;
    message?: string;
}
export interface VersionInfo {
    sdk: string;
    api: string;
    min_sdk_version: string;
    changelog_url: string;
    latest_release: string;
}
export interface FeatureSet {
    features: Record<string, boolean>;
    experiments: Record<string, string | boolean | number>;
    rollouts: Record<string, number>;
}
export interface FrameworkPlugin {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    config?: Record<string, unknown>;
}
export interface EnvironmentConfig {
    environment: "development" | "staging" | "production";
    debug: boolean;
    log_level: "error" | "warn" | "info" | "debug" | "trace";
    base_url: string;
    cdn_url: string;
    timeout_ms: number;
}
export declare class FrameworkClient {
    private readonly http;
    private cachedConfig;
    private cachedFeatures;
    constructor(http: HttpClient);
    getConfig(): Promise<FrameworkConfig>;
    refreshConfig(): Promise<FrameworkConfig>;
    getFeatures(): Promise<FeatureSet>;
    isFeatureEnabled(featureName: string): Promise<boolean>;
    getExperimentValue(experimentName: string): Promise<string | boolean | number | undefined>;
    getRolloutPercentage(rolloutName: string): Promise<number>;
    checkHealth(): Promise<HealthStatus>;
    isHealthy(): Promise<boolean>;
    getVersion(): Promise<VersionInfo>;
    checkForUpdates(): Promise<{
        hasUpdate: boolean;
        current: string;
        latest: string;
        releaseNotes?: string;
    }>;
    getEnvironment(): Promise<EnvironmentConfig>;
    getPlugins(): Promise<FrameworkPlugin[]>;
    enablePlugin(pluginId: string): Promise<FrameworkPlugin>;
    disablePlugin(pluginId: string): Promise<FrameworkPlugin>;
    clearCache(): void;
}
export declare function createFrameworkClient(http: HttpClient): FrameworkClient;
//# sourceMappingURL=index.d.ts.map