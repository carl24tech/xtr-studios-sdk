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
        const response = await this.http.post(url, { code, planId });
        return response.data;
    }

    async getInvoices(page = 1, limit = 10) {
        const url = this.http.buildUrl(`${constants_1.ENDPOINTS.freemium.status}/invoices`);
        const response = await this.http.get(url, { page, limit });
        return response.data;
    }

    isStreamingAllowed(status) {
        if (!status?.active) return false;
        const plan = status?.plan;
        if (!plan) return false;
        if (plan.max_streams_per_day && status.usage?.streams_today >= plan.max_streams_per_day) return false;
        if (plan.max_streams_per_month && status.usage?.streams_this_month >= plan.max_streams_per_month) return false;
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
        const getScore = (plan) => {
            let score = 0;
            if (plan?.max_streams_per_day) score += plan.max_streams_per_day * 10;
            if (plan?.max_streams_per_month) score += plan.max_streams_per_month;
            if (plan?.allowed_qualities?.includes(constants_1.QUALITY_LEVELS.UHD)) score += 100;
            else if (plan?.allowed_qualities?.includes(constants_1.QUALITY_LEVELS.FHD)) score += 50;
            else if (plan?.allowed_qualities?.includes(constants_1.QUALITY_LEVELS.HD)) score += 25;
            if (plan?.features) score += Object.keys(plan.features).length * 5;
            if (!plan?.has_ads) score += 75;
            return score;
        };

        const score1 = getScore(plan1);
        const score2 = getScore(plan2);
        const better = score1 >= score2 ? plan1 : plan2;
        const improvements = [];

        if (plan2?.max_streams_per_day !== plan1?.max_streams_per_day) {
            const betterValue = Math.max(plan1?.max_streams_per_day || 0, plan2?.max_streams_per_day || 0);
            improvements.push(`${better.max_streams_per_day} streams per day`);
        }
        if (plan2?.allowed_qualities?.length !== plan1?.allowed_qualities?.length) {
            const betterQuality = this.getQualityLimit(better);
            improvements.push(`Up to ${betterQuality} quality`);
        }
        if (plan2?.has_ads !== plan1?.has_ads && !better?.has_ads) {
            improvements.push(`Ad-free experience`);
        }

        return { better, improvements };
    }
}
exports.FreemiumClient = FreemiumClient;

function createFreemiumClient(http) {
    return new FreemiumClient(http);
}
