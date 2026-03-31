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
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.freemium.plans}/${planId}`);
        const response = await this.http.get(url);
        return response.data;
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
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.freemium.plans}/validate-coupon`);
        const response = await this.http.post(url, { code, plan_id: planId });
        return response.data;
    }

    async getInvoices(page = 1, limit = 20) {
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.freemium.status}/invoices`);
        const response = await this.http.get(url, { page, limit });
        return response.data;
    }

    isStreamingAllowed(status) {
        if (!status?.active) return false;
        const plan = status?.plan;
        const usage = status?.usage;
        
        if (!plan) return false;
        if (plan.max_streams_per_day === -1 && plan.max_streams_per_month === -1) return true;
        
        if (plan.max_streams_per_day && usage?.streams_today >= plan.max_streams_per_day) return false;
        if (plan.max_streams_per_month && usage?.streams_this_month >= plan.max_streams_per_month) return false;
        
        return true;
    }

    getQualityLimit(plan) {
        if (!plan?.allowed_qualities) return constants_1.QUALITY_LEVELS.SD;
        if (plan.allowed_qualities.includes(constants_1.QUALITY_LEVELS.UHD)) return constants_1.QUALITY_LEVELS.UHD;
        if (plan.allowed_qualities.includes(constants_1.QUALITY_LEVELS.FHD)) return constants_1.QUALITY_LEVELS.FHD;
        if (plan.allowed_qualities.includes(constants_1.QUALITY_LEVELS.HD)) return constants_1.QUALITY_LEVELS.HD;
        return constants_1.QUALITY_LEVELS.SD;
    }

    hasAds(plan) {
        return plan?.has_ads ?? true;
    }

    comparePlans(plan1, plan2) {
        const qualityOrder = [
            constants_1.QUALITY_LEVELS.SD,
            constants_1.QUALITY_LEVELS.HD,
            constants_1.QUALITY_LEVELS.FHD,
            constants_1.QUALITY_LEVELS.UHD
        ];
        
        const p1Quality = this.getQualityLimit(plan1);
        const p2Quality = this.getQualityLimit(plan2);
        const p1QualityIdx = qualityOrder.indexOf(p1Quality);
        const p2QualityIdx = qualityOrder.indexOf(p2Quality);
        
        const better = p1QualityIdx >= p2QualityIdx ? plan1 : plan2;
        const improvements = [];
        
        if (p2QualityIdx > p1QualityIdx) {
            improvements.push(`Higher quality: up to ${p2Quality}`);
        }
        
        if (!this.hasAds(plan2) && this.hasAds(plan1)) {
            improvements.push("Ad-free experience");
        }
        
        const p1Streams = plan1?.max_streams_per_day ?? 0;
        const p2Streams = plan2?.max_streams_per_day ?? 0;
        
        if (p2Streams > p1Streams || p2Streams === -1) {
            improvements.push(p2Streams === -1
                ? "Unlimited streams per day"
                : `More streams: ${p2Streams} per day`);
        }
        
        return { better, improvements };
    }
}
exports.FreemiumClient = FreemiumClient;

function createFreemiumClient(http) {
    return new FreemiumClient(http);
}
