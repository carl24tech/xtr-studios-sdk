"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreemiumClient = void 0;
exports.createFreemiumClient = createFreemiumClient;
const constants_1 = require("../lib/constants");
class FreemiumClient {
    constructor(http) {
        this.http = http;
    }
    async getPlans() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.plans);
        const response = await this.http.get(url);
        return response.data;
    }
    async getPlan(planId) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.plans) +
            this.http.buildQueryString({ id: planId });
        const response = await this.http.get(url);
        const plan = response.data.find((p) => p.id === planId);
        if (!plan)
            throw new Error(`Plan "${planId}" not found`);
        return plan;
    }
    async subscribe(request) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.subscribe);
        const response = await this.http.post(url, request);
        return response.data;
    }
    async cancel(reason) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.cancel);
        const response = await this.http.post(url, { reason });
        return response.data;
    }
    async upgrade(request) {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.upgrade);
        const response = await this.http.post(url, request);
        return response.data;
    }
    async getStatus() {
        const url = this.http.buildUrl(constants_1.ENDPOINTS.freemium.status);
        const response = await this.http.get(url);
        return response.data;
    }
    async validateCoupon(code, planId) {
        const url = this.http.buildUrl("/api/freemium/coupons/validate") +
            this.http.buildQueryString({ code, plan_id: planId });
        const response = await this.http.get(url);
        return response.data;
    }
    async getInvoices(page = 1, limit = 20) {
        const url = this.http.buildUrl("/api/freemium/invoices") +
            this.http.buildQueryString({ page, limit });
        const response = await this.http.get(url);
        return response.data;
    }
    isStreamingAllowed(status) {
        if (!status.active)
            return false;
        if (status.plan.max_streams === -1)
            return true;
        return status.usage.streams_today < status.plan.max_streams;
    }
    getQualityLimit(plan) {
        return plan.quality_limit;
    }
    hasAds(plan) {
        return plan.ads;
    }
    comparePlans(plan1, plan2) {
        const qualityOrder = ["480p", "720p", "1080p", "4K"];
        const p1QualityIdx = qualityOrder.indexOf(plan1.quality_limit);
        const p2QualityIdx = qualityOrder.indexOf(plan2.quality_limit);
        const better = p1QualityIdx >= p2QualityIdx ? plan1 : plan2;
        const improvements = [];
        if (p2QualityIdx > p1QualityIdx) {
            improvements.push(`Higher quality: up to ${plan2.quality_limit}`);
        }
        if (!plan2.ads && plan1.ads) {
            improvements.push("No ads");
        }
        if (plan2.max_streams > plan1.max_streams || plan2.max_streams === -1) {
            improvements.push(plan2.max_streams === -1
                ? "Unlimited streams"
                : `More streams: ${plan2.max_streams}/day`);
        }
        return { better, improvements };
    }
}
exports.FreemiumClient = FreemiumClient;
function createFreemiumClient(http) {
    return new FreemiumClient(http);
}
//# sourceMappingURL=index.js.map