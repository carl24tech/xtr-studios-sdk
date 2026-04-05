import { HttpClient } from "../lib/http";
import { ENDPOINTS, SDK_VERSION } from "../lib/constants";
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

export class FrameworkClient {
  private readonly http: HttpClient;
  private cachedConfig: FrameworkConfig | null = null;
  private cachedFeatures: FeatureSet | null = null;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getConfig(): Promise<FrameworkConfig> {
    if (this.cachedConfig) return this.cachedConfig;
    const url = this.http.buildUrl(ENDPOINTS.framework.config);
    const response = await this.http.get<FrameworkConfig>(url);
    this.cachedConfig = response.data;
    return response.data;
  }

  async refreshConfig(): Promise<FrameworkConfig> {
    this.cachedConfig = null;
    return this.getConfig();
  }

  async getFeatures(): Promise<FeatureSet> {
    if (this.cachedFeatures) return this.cachedFeatures;
    const url = this.http.buildUrl(ENDPOINTS.framework.features);
    const response = await this.http.get<FeatureSet>(url);
    this.cachedFeatures = response.data;
    return response.data;
  }

  async isFeatureEnabled(featureName: string): Promise<boolean> {
    const features = await this.getFeatures();
    return features.features[featureName] ?? false;
  }

  async getExperimentValue(
    experimentName: string
  ): Promise<string | boolean | number | undefined> {
    const features = await this.getFeatures();
    return features.experiments[experimentName];
  }

  async getRolloutPercentage(rolloutName: string): Promise<number> {
    const features = await this.getFeatures();
    return features.rollouts[rolloutName] ?? 0;
  }

  async checkHealth(): Promise<HealthStatus> {
    const url = this.http.buildUrl(ENDPOINTS.framework.health);
    const response = await this.http.get<HealthStatus>(url);
    return response.data;
  }

  async isHealthy(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === "healthy";
  }

  async getVersion(): Promise<VersionInfo> {
    const url = this.http.buildUrl(ENDPOINTS.framework.version);
    const response = await this.http.get<VersionInfo>(url);
    return response.data;
  }

  async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    current: string;
    latest: string;
    releaseNotes?: string;
  }> {
    const versionInfo = await this.getVersion();
    const currentVersionParts = SDK_VERSION.split(".").map(Number);
    const latestVersionParts = versionInfo.latest_release.split(".").map(Number);
    
    let hasUpdate = false;
    for (let i = 0; i < Math.max(currentVersionParts.length, latestVersionParts.length); i++) {
      const current = currentVersionParts[i] || 0;
      const latest = latestVersionParts[i] || 0;
      if (latest > current) {
        hasUpdate = true;
        break;
      }
      if (latest < current) break;
    }
    
    return {
      hasUpdate,
      current: SDK_VERSION,
      latest: versionInfo.latest_release,
    };
  }

  async getEnvironment(): Promise<EnvironmentConfig> {
    const url = this.http.buildUrl(ENDPOINTS.framework.environment);
    const response = await this.http.get<EnvironmentConfig>(url);
    return response.data;
  }

  async getPlugins(): Promise<FrameworkPlugin[]> {
    const url = this.http.buildUrl(ENDPOINTS.framework.plugins);
    const response = await this.http.get<FrameworkPlugin[]>(url);
    return response.data;
  }

  async enablePlugin(pluginId: string): Promise<FrameworkPlugin> {
    const url = this.http.buildUrl(ENDPOINTS.framework.plugins) +
      this.http.buildQueryString({ action: "enable", id: pluginId });
    const response = await this.http.post<FrameworkPlugin>(url);
    return response.data;
  }

  async disablePlugin(pluginId: string): Promise<FrameworkPlugin> {
    const url = this.http.buildUrl(ENDPOINTS.framework.plugins) +
      this.http.buildQueryString({ action: "disable", id: pluginId });
    const response = await this.http.post<FrameworkPlugin>(url);
    return response.data;
  }

  clearCache(): void {
    this.cachedConfig = null;
    this.cachedFeatures = null;
  }
}

export function createFrameworkClient(http: HttpClient): FrameworkClient {
  return new FrameworkClient(http);
}
