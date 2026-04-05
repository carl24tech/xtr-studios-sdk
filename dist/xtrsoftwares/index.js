"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XtrSoftwaresClient = void 0;
exports.createXtrSoftwaresClient = createXtrSoftwaresClient;
const constants_1 = require("../lib/constants");
const utils_1 = require("../lib/utils");
class XtrSoftwaresClient {
    constructor(http) {
        this.http = http;
    }
    async getPackages(filters = {}) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrsoftwares.packages) +
            this.http.buildQueryString(filters);
        const response = await this.http.get(url);
        return response.data;
    }
    async getPackageById(id) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrsoftwares.packages) +
            this.http.buildQueryString({ id });
        const response = await this.http.get(url);
        return response.data;
    }
    async getDownloadInfo(id) {
        const path = (0, utils_1.interpolatePath)(constants_1.ENDPOINTS.xtrsoftwares.download, { id });
        const url = this.http.buildUrl(path);
        const response = await this.http.get(url);
        return {
            ...response.data,
            size_formatted: (0, utils_1.formatBytes)(response.data.size),
        };
    }
    async getChangelog(id) {
        const path = (0, utils_1.interpolatePath)(constants_1.ENDPOINTS.xtrsoftwares.changelog, { id });
        const url = this.http.buildUrl(path);
        const response = await this.http.get(url);
        return response.data;
    }
    async getLatest(limit = 10) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrsoftwares.latest) +
            this.http.buildQueryString({ limit });
        const response = await this.http.get(url);
        return response.data;
    }
    async checkCompatibility(packageId, platform, osVersion) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.xtrsoftwares.compatibility) +
            this.http.buildQueryString({
                package_id: packageId,
                platform,
                os_version: osVersion,
            });
        const response = await this.http.get(url);
        return response.data;
    }
    async searchPackages(query, filters = {}) {
        return this.getPackages({ ...filters, search: query });
    }
    async getPackagesByPlatform(platform) {
        const result = await this.getPackages({ platform, limit: 100 });
        return result.packages;
    }
    async verifyChecksum(packageId, checksum, algorithm = "sha256") {
        const downloadInfo = await this.getDownloadInfo(packageId);
        return (downloadInfo.checksum === checksum &&
            downloadInfo.algorithm === algorithm);
    }
    getLatestChangelogEntry(changelog) {
        return changelog.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())[0];
    }
    getBreakingChanges(changelog) {
        return changelog
            .filter((entry) => entry.breaking_changes && entry.breaking_changes.length > 0)
            .map((entry) => ({
            version: entry.version,
            changes: entry.breaking_changes,
        }));
    }
    filterChangesByType(entries, type) {
        const results = [];
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
exports.XtrSoftwaresClient = XtrSoftwaresClient;
function createXtrSoftwaresClient(http) {
    return new XtrSoftwaresClient(http);
}
