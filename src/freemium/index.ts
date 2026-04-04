import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
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

export class FreemiumClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getPlans(): Promise<FreemiumPlan[]> {
    const url = this.http.buildUrl(ENDPOINTS.freemium.plans);
    const response = await this.http.get<FreemiumPlan[]>(url);
    return response.data;
  }

  async getPlan(planId: string): Promise<FreemiumPlan> {
    const url =
      this.http.buildUrl(ENDPOINTS.freemium.plans) +
      this.http.buildQueryString({ id: planId });
    const response = await this.http.get<FreemiumPlan[]>(url);
    const plan = response.data.find((p) => p.id === planId);
    if (!plan) throw new Error(`Plan "${planId}" not found`);
    return plan;
  }

  async subscribe(request: SubscribeRequest): Promise<SubscribeResult> {
    const url = this.http.buildUrl(ENDPOINTS.freemium.subscribe);
    const response = await this.http.post<SubscribeResult>(url, request);
    return response.data;
  }

  async cancel(reason?: string): Promise<{ success: boolean; message: string }> {
    const url = this.http.buildUrl(ENDPOINTS.freemium.cancel);
    const response = await this.http.post<{ success: boolean; message: string }>(
      url,
      { reason }
    );
    return response.data;
  }

  async upgrade(request: UpgradeRequest): Promise<SubscribeResult> {
    const url = this.http.buildUrl(ENDPOINTS.freemium.upgrade);
    const response = await this.http.post<SubscribeResult>(url, request);
    return response.data;
  }

  async getStatus(): Promise<FreemiumStatus> {
    const url = this.http.buildUrl(ENDPOINTS.freemium.status);
    const response = await this.http.get<FreemiumStatus>(url);
    return response.data;
  }

  async validateCoupon(code: string, planId?: string): Promise<CouponValidation> {
    const url =
      this.http.buildUrl(ENDPOINTS.freemium.coupons) +
      this.http.buildQueryString({ code, plan_id: planId });
    const response = await this.http.get<CouponValidation>(url);
    return response.data;
  }

  async getInvoices(page = 1, limit = 20): Promise<{
    invoices: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      created_at: string;
      pdf_url?: string;
    }>;
    total: number;
  }> {
    const url =
      this.http.buildUrl(ENDPOINTS.freemium.invoices) +
      this.http.buildQueryString({ page, limit });
    const response = await this.http.get<{
      invoices: Array<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        created_at: string;
        pdf_url?: string;
      }>;
      total: number;
    }>(url);
    return response.data;
  }

  isStreamingAllowed(status: FreemiumStatus): boolean {
    if (!status.active) return false;
    if (status.plan.max_streams === -1) return true;
    return status.usage.streams_today < status.plan.max_streams;
  }

  getQualityLimit(plan: FreemiumPlan): string {
    return plan.quality_limit;
  }

  hasAds(plan: FreemiumPlan): boolean {
    return plan.ads;
  }

  comparePlans(
    plan1: FreemiumPlan,
    plan2: FreemiumPlan
  ): { better: FreemiumPlan; improvements: string[] } {
    const qualityOrder = ["480p", "720p", "1080p", "4K"];
    const p1QualityIdx = qualityOrder.indexOf(plan1.quality_limit);
    const p2QualityIdx = qualityOrder.indexOf(plan2.quality_limit);

    const better = p2QualityIdx > p1QualityIdx ? plan2 : plan1;
    const improvements: string[] = [];

    if (p2QualityIdx > p1QualityIdx) {
      improvements.push(`Higher quality: up to ${plan2.quality_limit}`);
    }
    if (!plan2.ads && plan1.ads) {
      improvements.push("No ads");
    }
    if (plan2.max_streams > plan1.max_streams) {
      improvements.push(
        plan2.max_streams === -1
          ? "Unlimited streams"
          : `More streams: ${plan2.max_streams}/day`
      );
    }

    return { better, improvements };
  }
}

export function createFreemiumClient(http: HttpClient): FreemiumClient {
  return new FreemiumClient(http);
}
