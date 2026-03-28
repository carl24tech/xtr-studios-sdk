import { HttpClient } from "../lib/http";
import { FreemiumPlan, UserSession } from "../lib/types";
export interface SubscribeRequest {
    plan_id: string;
    payment_method?: string;
    coupon_code?: string;
}
export interface SubscribeResult {
    session: UserSession;
    payment_url?: string;
    message: string;
}
export interface UpgradeRequest {
    new_plan_id: string;
    immediate?: boolean;
}
export interface FreemiumStatus {
    active: boolean;
    plan: FreemiumPlan;
    started_at: string;
    renews_at?: string;
    cancels_at?: string;
    usage: {
        streams_today: number;
        streams_this_month: number;
        quality_used: string;
    };
}
export interface CouponValidation {
    valid: boolean;
    discount?: number;
    discount_type?: "percentage" | "fixed";
    expires_at?: string;
    message?: string;
}
export declare class FreemiumClient {
    private readonly http;
    constructor(http: HttpClient);
    getPlans(): Promise<FreemiumPlan[]>;
    getPlan(planId: string): Promise<FreemiumPlan>;
    subscribe(request: SubscribeRequest): Promise<SubscribeResult>;
    cancel(reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    upgrade(request: UpgradeRequest): Promise<SubscribeResult>;
    getStatus(): Promise<FreemiumStatus>;
    validateCoupon(code: string, planId?: string): Promise<CouponValidation>;
    getInvoices(page?: number, limit?: number): Promise<{
        invoices: Array<{
            id: string;
            amount: number;
            currency: string;
            status: string;
            created_at: string;
            pdf_url?: string;
        }>;
        total: number;
    }>;
    isStreamingAllowed(status: FreemiumStatus): boolean;
    getQualityLimit(plan: FreemiumPlan): string;
    hasAds(plan: FreemiumPlan): boolean;
    comparePlans(plan1: FreemiumPlan, plan2: FreemiumPlan): {
        better: FreemiumPlan;
        improvements: string[];
    };
}
export declare function createFreemiumClient(http: HttpClient): FreemiumClient;
//# sourceMappingURL=index.d.ts.map