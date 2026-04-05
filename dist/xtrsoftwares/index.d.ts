import { HttpClient } from "../lib/http";
import { SoftwarePackage } from "../lib/types";

export interface PackageFilter {
    platform?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface ChangelogEntry {
    version: string;
    release_date: string;
    type: "major" | "minor" | "patch" | "hotfix";
    changes: ChangeItem[];
    upgrade_notes?: string;
    breaking_changes?: string[];
}

export interface ChangeItem {
    type: "feature" | "fix" | "improvement" | "security" | "deprecation";
    description: string;
    issue_url?: string;
}

export interface DownloadInfo {
    url: string;
    checksum: string;
    algorithm: "md5" | "sha1" | "sha256";
    size: number;
    size_formatted: string;
    expires_at?: string;
    instructions: string[];
}

export interface PackageCompatibility {
    package_id: string;
    compatible: boolean;
    platform_support: Record<string, boolean>;
    min_os_versions: Record<string, string>;
    notes?: string;
}

export interface LatestReleases {
    packages: Array<SoftwarePackage & {
        is_new: boolean;
        days_since_release: number;
    }>;
    total: number;
}

export declare class XtrSoftwaresClient {
    private readonly http;
    constructor(http: HttpClient);
    getPackages(filters?: PackageFilter): Promise<{
        packages: SoftwarePackage[];
        total: number;
        page: number;
        total_pages: number;
    }>;
    getPackageById(id: string): Promise<SoftwarePackage>;
    getDownloadInfo(id: string): Promise<DownloadInfo>;
    getChangelog(id: string): Promise<ChangelogEntry[]>;
    getLatest(limit?: number): Promise<LatestReleases>;
    checkCompatibility(packageId: string, platform: string, osVersion: string): Promise<PackageCompatibility>;
    searchPackages(query: string, filters?: PackageFilter): Promise<{
        packages: SoftwarePackage[];
        total: number;
    }>;
    getPackagesByPlatform(platform: string): Promise<SoftwarePackage[]>;
    verifyChecksum(packageId: string, checksum: string, algorithm?: "md5" | "sha1" | "sha256"): Promise<boolean>;
    getLatestChangelogEntry(changelog: ChangelogEntry[]): ChangelogEntry | undefined;
    getBreakingChanges(changelog: ChangelogEntry[]): Array<{
        version: string;
        changes: string[];
    }>;
    filterChangesByType(entries: ChangelogEntry[], type: ChangeItem["type"]): Array<{
        version: string;
        change: ChangeItem;
    }>;
}

export declare function createXtrSoftwaresClient(http: HttpClient): XtrSoftwaresClient;
