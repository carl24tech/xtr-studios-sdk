import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import { SoftwarePackage } from "../lib/types";
import { interpolatePath, formatBytes } from "../lib/utils";

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
  packages: Array<SoftwarePackage & { is_new: boolean; days_since_release: number }>;
  total: number;
}

export class XtrSoftwaresClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getPackages(filters: PackageFilter = {}): Promise<{
    packages: SoftwarePackage[];
    total: number;
    page: number;
    total_pages: number;
  }> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrsoftwares.packages) +
      this.http.buildQueryString(filters as Record<string, unknown>);
    const response = await this.http.get<{
      packages: SoftwarePackage[];
      total: number;
      page: number;
      total_pages: number;
    }>(url);
    return response.data;
  }

  async getPackageById(id: string): Promise<SoftwarePackage> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrsoftwares.packages) +
      this.http.buildQueryString({ id });
    const response = await this.http.get<SoftwarePackage>(url);
    return response.data;
  }

  async getDownloadInfo(id: string): Promise<DownloadInfo> {
    const path = interpolatePath(ENDPOINTS.xtrsoftwares.download, { id });
    const url = this.http.buildUrl(path);
    const response = await this.http.get<DownloadInfo>(url);
    return {
      ...response.data,
      size_formatted: formatBytes(response.data.size),
    };
  }

  async getChangelog(id: string): Promise<ChangelogEntry[]> {
    const path = interpolatePath(ENDPOINTS.xtrsoftwares.changelog, { id });
    const url = this.http.buildUrl(path);
    const response = await this.http.get<ChangelogEntry[]>(url);
    return response.data;
  }

  async getLatest(limit = 10): Promise<LatestReleases> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrsoftwares.latest) +
      this.http.buildQueryString({ limit });
    const response = await this.http.get<LatestReleases>(url);
    return response.data;
  }

  async checkCompatibility(
    packageId: string,
    platform: string,
    osVersion: string
  ): Promise<PackageCompatibility> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrsoftwares.compatibility) +
      this.http.buildQueryString({
        package_id: packageId,
        platform,
        os_version: osVersion,
      });
    const response = await this.http.get<PackageCompatibility>(url);
    return response.data;
  }

  async searchPackages(query: string, filters: PackageFilter = {}): Promise<{
    packages: SoftwarePackage[];
    total: number;
  }> {
    return this.getPackages({ ...filters, search: query });
  }

  async getPackagesByPlatform(platform: string): Promise<SoftwarePackage[]> {
    const result = await this.getPackages({ platform, limit: 100 });
    return result.packages;
  }

  async verifyChecksum(
    packageId: string,
    checksum: string,
    algorithm: "md5" | "sha1" | "sha256" = "sha256"
  ): Promise<boolean> {
    const downloadInfo = await this.getDownloadInfo(packageId);
    return (
      downloadInfo.checksum === checksum &&
      downloadInfo.algorithm === algorithm
    );
  }

  getLatestChangelogEntry(changelog: ChangelogEntry[]): ChangelogEntry | undefined {
    return changelog.sort(
      (a, b) =>
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    )[0];
  }

  getBreakingChanges(changelog: ChangelogEntry[]): Array<{
    version: string;
    changes: string[];
  }> {
    return changelog
      .filter(
        (entry) => entry.breaking_changes && entry.breaking_changes.length > 0
      )
      .map((entry) => ({
        version: entry.version,
        changes: entry.breaking_changes!,
      }));
  }

  filterChangesByType(
    entries: ChangelogEntry[],
    type: ChangeItem["type"]
  ): Array<{ version: string; change: ChangeItem }> {
    const results: Array<{ version: string; change: ChangeItem }> = [];
    for (const entry of entries) {
      for (const change of entry.changes) {
        if (change.type === type) {
          results.push({ version: entry.version, change });
        }
      }
    }
    return results;
  }
}

export function createXtrSoftwaresClient(
  http: HttpClient
): XtrSoftwaresClient {
  return new XtrSoftwaresClient(http);
}
