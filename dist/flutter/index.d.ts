import { HttpClient } from "../lib/http";
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
export declare class FlutterClient {
    private readonly http;
    constructor(http: HttpClient);
    getPlugins(platform?: "android" | "ios" | "web" | "desktop"): Promise<FlutterPlugin[]>;
    getConfig(appId: string): Promise<FlutterConfig>;
    getAssets(version?: string): Promise<FlutterAsset[]>;
    getManifest(): Promise<FlutterManifest>;
    updateConfig(appId: string, config: Partial<FlutterConfig>): Promise<FlutterConfig>;
    getInstallGuide(pluginName: string): Promise<PluginInstallGuide>;
    generatePubspecEntry(plugin: FlutterPlugin): string;
    generateInitCode(config: FlutterConfig): string;
    getDefaultPlayerConfig(): PlayerConfig;
    getDefaultTheme(darkMode?: boolean): ThemeConfig;
    validateConfig(config: Partial<FlutterConfig>): string[];
}
export declare function createFlutterClient(http: HttpClient): FlutterClient;
//# sourceMappingURL=index.d.ts.map