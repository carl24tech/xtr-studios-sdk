import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import { FlutterPlugin } from "../lib/types";

export interface FlutterConfig {
  api_base_url: string;
  app_id: string;
  version: string;
  player_config: PlayerConfig;
  theme: ThemeConfig;
  features: FeatureFlags;
}

export interface PlayerConfig {
  default_quality: string;
  auto_play: boolean;
  preload: boolean;
  pip_enabled: boolean;
  cast_enabled: boolean;
  subtitle_default_language: string;
  skip_intro_seconds?: number;
  skip_credits_seconds?: number;
}

export interface ThemeConfig {
  primary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  dark_mode: boolean;
}

export interface FeatureFlags {
  offline_download: boolean;
  picture_in_picture: boolean;
  chromecast: boolean;
  airplay: boolean;
  profile_avatars: boolean;
  parental_controls: boolean;
  watchlist: boolean;
  continue_watching: boolean;
}

export interface FlutterManifest {
  version: string;
  min_flutter_version: string;
  min_dart_version: string;
  plugins: FlutterPlugin[];
  assets: FlutterAsset[];
  permissions: string[];
}

export interface FlutterAsset {
  path: string;
  url: string;
  type: "image" | "font" | "video" | "audio" | "json";
  checksum: string;
  size: number;
}

export interface PluginInstallGuide {
  plugin: FlutterPlugin;
  pubspec_entry: string;
  import_statement: string;
  initialization_code: string;
  android_permissions?: string[];
  ios_permissions?: string[];
}

export class FlutterClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getPlugins(
    platform?: "android" | "ios" | "web" | "desktop"
  ): Promise<FlutterPlugin[]> {
    try {
      const queryParams = platform ? { platform } : {};
      const url = this.http.buildUrl(
        ENDPOINTS.flutter.plugins,
        queryParams
      );
      const response = await this.http.get<FlutterPlugin[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch plugins:", error);
      throw error;
    }
  }

  async getConfig(appId: string): Promise<FlutterConfig> {
    try {
      const url = this.http.buildUrl(
        ENDPOINTS.flutter.config,
        { app_id: appId }
      );
      const response = await this.http.get<FlutterConfig>(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch config for app ${appId}:`, error);
      throw error;
    }
  }

  async getAssets(version?: string): Promise<FlutterAsset[]> {
    try {
      const queryParams = version ? { version } : {};
      const url = this.http.buildUrl(
        ENDPOINTS.flutter.assets,
        queryParams
      );
      const response = await this.http.get<FlutterAsset[]>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  }

  async getManifest(): Promise<FlutterManifest> {
    try {
      const url = this.http.buildUrl(ENDPOINTS.flutter.manifest);
      const response = await this.http.get<FlutterManifest>(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch manifest:", error);
      throw error;
    }
  }

  async updateConfig(
    appId: string,
    config: Partial<FlutterConfig>
  ): Promise<FlutterConfig> {
    try {
      const validationErrors = this.validateConfig({ app_id: appId, ...config });
      if (validationErrors.length > 0) {
        throw new Error(`Invalid config: ${validationErrors.join(", ")}`);
      }
      
      const url = this.http.buildUrl(ENDPOINTS.flutter.config);
      const response = await this.http.put<FlutterConfig>(url, {
        app_id: appId,
        ...config,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update config for app ${appId}:`, error);
      throw error;
    }
  }

  async getInstallGuide(pluginName: string): Promise<PluginInstallGuide> {
    try {
      if (!pluginName || pluginName.trim() === "") {
        throw new Error("Plugin name is required");
      }
      
      const url = this.http.buildUrl(
        ENDPOINTS.flutter.plugins,
        { name: pluginName, guide: true }
      );
      const response = await this.http.get<PluginInstallGuide>(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch install guide for plugin ${pluginName}:`, error);
      throw error;
    }
  }

  generatePubspecEntry(plugin: FlutterPlugin): string {
    if (!plugin?.name || !plugin?.version) {
      throw new Error("Plugin must have both name and version");
    }
    return `  ${plugin.name}: ^${plugin.version}`;
  }

  generateInitCode(config: FlutterConfig): string {
    if (!config?.api_base_url || !config?.app_id) {
      throw new Error("Config must have api_base_url and app_id");
    }
    
    return `import 'package:xtr_studios_sdk/xtr_studios_sdk.dart';

void initializeXTRStudios() {
  XtrStudiosSDK.initialize(
    apiKey: 'YOUR_API_KEY',
    baseUrl: '${config.api_base_url}',
    appId: '${config.app_id}',
  );
}

// Call this method in your main.dart
// initializeXTRStudios();`;
  }

  getDefaultPlayerConfig(): PlayerConfig {
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

  getDefaultTheme(darkMode = true): ThemeConfig {
    return {
      primary_color: "#E50914",
      accent_color: "#F5F5F1",
      background_color: darkMode ? "#141414" : "#FFFFFF",
      surface_color: darkMode ? "#1F1F1F" : "#F5F5F5",
      text_color: darkMode ? "#FFFFFF" : "#000000",
      dark_mode: darkMode,
    };
  }

  validateConfig(config: Partial<FlutterConfig>): string[] {
    const errors: string[] = [];
    if (!config.api_base_url) errors.push("api_base_url is required");
    if (!config.app_id) errors.push("app_id is required");
    if (!config.version) errors.push("version is required");
    return errors;
  }

  // Helper method to merge configs
  mergeConfigs(base: FlutterConfig, overrides: Partial<FlutterConfig>): FlutterConfig {
    return {
      ...base,
      ...overrides,
      player_config: { ...base.player_config, ...overrides.player_config },
      theme: { ...base.theme, ...overrides.theme },
      features: { ...base.features, ...overrides.features },
    };
  }

  // Helper method to validate manifest
  validateManifest(manifest: FlutterManifest): boolean {
    if (!manifest.version) return false;
    if (!manifest.min_flutter_version) return false;
    if (!Array.isArray(manifest.plugins)) return false;
    if (!Array.isArray(manifest.assets)) return false;
    return true;
  }
}

export function createFlutterClient(http: HttpClient): FlutterClient {
  if (!http) {
    throw new Error("HttpClient is required to create FlutterClient");
  }
  return new FlutterClient(http);
}
