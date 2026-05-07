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

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  created_at: string;
  pdf_url?: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export class FreemiumClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    if (!http) {
      throw new Error("HttpClient is required to initialize FreemiumClient");
    }
    this.http = http;
  }

  async getPlans(): Promise<FreemiumPlan[]> {
    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.plans);
      const response = await this.http.get<FreemiumPlan[]>(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format: expected array of plans");
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      throw new Error(`Unable to retrieve subscription plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlan(planId: string): Promise<FreemiumPlan> {
    if (!planId || planId.trim() === "") {
      throw new Error("Plan ID is required");
    }

    try {
      const url = this.http.buildUrl(
        ENDPOINTS.freemium.plans,
        { id: planId }
      );
      const response = await this.http.get<FreemiumPlan[]>(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from server");
      }
      
      const plan = response.data.find((p) => p.id === planId);
      if (!plan) {
        throw new Error(`Plan "${planId}" not found`);
      }
      
      return plan;
    } catch (error) {
      console.error(`Failed to fetch plan ${planId}:`, error);
      throw error;
    }
  }

  async subscribe(request: SubscribeRequest): Promise<SubscribeResult> {
    // Validate request
    if (!request.plan_id || request.plan_id.trim() === "") {
      throw new Error("Plan ID is required for subscription");
    }

    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.subscribe);
      const response = await this.http.post<SubscribeResult>(url, request);
      
      if (!response.data || !response.data.session) {
        throw new Error("Invalid subscription response: missing session data");
      }
      
      return response.data;
    } catch (error) {
      console.error("Subscription failed:", error);
      throw new Error(`Unable to complete subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancel(reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.cancel);
      const response = await this.http.post<{ success: boolean; message: string }>(
        url,
        { reason: reason || "No reason provided" }
      );
      
      return response.data;
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw new Error(`Unable to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async upgrade(request: UpgradeRequest): Promise<SubscribeResult> {
    if (!request.new_plan_id || request.new_plan_id.trim() === "") {
      throw new Error("New plan ID is required for upgrade");
    }

    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.upgrade);
      const response = await this.http.post<SubscribeResult>(url, {
        ...request,
        immediate: request.immediate ?? false // Default to false if not provided
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to upgrade plan:", error);
      throw new Error(`Unable to upgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStatus(): Promise<FreemiumStatus> {
    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.status);
      const response = await this.http.get<FreemiumStatus>(url);
      
      if (!response.data) {
        throw new Error("Invalid status response");
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      throw new Error(`Unable to retrieve subscription status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCoupon(code: string, planId?: string): Promise<CouponValidation> {
    if (!code || code.trim() === "") {
      throw new Error("Coupon code is required");
    }

    try {
      const queryParams: Record<string, string | undefined> = { code };
      if (planId) {
        queryParams.plan_id = planId;
      }
      
      const url = this.http.buildUrl(ENDPOINTS.freemium.coupons, queryParams);
      const response = await this.http.get<CouponValidation>(url);
      
      return response.data;
    } catch (error) {
      console.error("Failed to validate coupon:", error);
      throw new Error(`Unable to validate coupon: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getInvoices(page = 1, limit = 20): Promise<InvoiceListResponse> {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    
    if (validLimit !== limit || validPage !== page) {
      console.warn(`Pagination parameters adjusted: page=${validPage}, limit=${validLimit}`);
    }

    try {
      const url = this.http.buildUrl(ENDPOINTS.freemium.invoices, {
        page: validPage,
        limit: validLimit
      });
      
      const response = await this.http.get<InvoiceListResponse>(url);
      
      return {
        ...response.data,
        page: validPage,
        limit: validLimit,
        has_more: response.data.has_more ?? response.data.invoices.length === validLimit
      };
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      throw new Error(`Unable to retrieve invoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isStreamingAllowed(status: FreemiumStatus): boolean {
    if (!status || !status.active) return false;
    if (!status.plan || typeof status.plan.max_streams !== 'number') return false;
    if (status.plan.max_streams === -1) return true;
    if (!status.usage || typeof status.usage.streams_today !== 'number') return false;
    
    return status.usage.streams_today < status.plan.max_streams;
  }

  getRemainingStreams(status: FreemiumStatus): number {
    if (!this.isStreamingAllowed(status)) return 0;
    if (status.plan.max_streams === -1) return Infinity;
    
    return Math.max(0, status.plan.max_streams - status.usage.streams_today);
  }

  getQualityLimit(plan: FreemiumPlan): string {
    if (!plan || !plan.quality_limit) {
      return "720p"; // Default fallback
    }
    return plan.quality_limit;
  }

  hasAds(plan: FreemiumPlan): boolean {
    return plan?.ads ?? true; // Default to true if plan is undefined
  }

  canDowngrade(currentPlan: FreemiumPlan, targetPlanId: string): boolean {
    const qualityOrder = ["480p", "720p", "1080p", "4K"];
    const currentQualityIdx = qualityOrder.indexOf(currentPlan.quality_limit);
    // This would typically require fetching the target plan first
    return true; // Implement proper logic based on your business rules
  }

  comparePlans(
    plan1: FreemiumPlan,
    plan2: FreemiumPlan
  ): { better: FreemiumPlan; improvements: string[]; differences: string[] } {
    if (!plan1 || !plan2) {
      throw new Error("Both plans are required for comparison");
    }

    const qualityOrder = ["480p", "720p", "1080p", "4K"];
    const p1QualityIdx = qualityOrder.indexOf(plan1.quality_limit);
    const p2QualityIdx = qualityOrder.indexOf(plan2.quality_limit);

    const isP2Better = p2QualityIdx > p1QualityIdx;
    const better = isP2Better ? plan2 : plan1;
    const improvements: string[] = [];
    const differences: string[] = [];

    // Quality comparison
    if (p2QualityIdx > p1QualityIdx) {
      improvements.push(`✨ Higher quality: up to ${plan2.quality_limit}`);
      differences.push(`Quality: ${plan1.quality_limit} → ${plan2.quality_limit}`);
    } else if (p2QualityIdx < p1QualityIdx) {
      differences.push(`Quality: ${plan1.quality_limit} → ${plan2.quality_limit}`);
    }

    // Ads comparison
    if (!plan2.ads && plan1.ads) {
      improvements.push("🚫 No ads");
      differences.push("Ads removed");
    } else if (plan2.ads && !plan1.ads) {
      differences.push("Ads introduced");
    }

    // Stream limits comparison
    if (plan2.max_streams === -1 && plan1.max_streams !== -1) {
      improvements.push("♾️ Unlimited streams");
      differences.push(`Stream limit: ${plan1.max_streams}/day → Unlimited`);
    } else if (plan2.max_streams > plan1.max_streams && plan1.max_streams !== -1) {
      improvements.push(`📺 More streams: ${plan2.max_streams}/day`);
      differences.push(`Stream limit: ${plan1.max_streams}/day → ${plan2.max_streams}/day`);
    } else if (plan2.max_streams < plan1.max_streams && plan2.max_streams !== -1) {
      differences.push(`Stream limit: ${plan1.max_streams}/day → ${plan2.max_streams}/day`);
    }

    // Price comparison
    if (plan2.price < plan1.price) {
      improvements.push(`💰 Lower price: ${plan2.currency} ${plan2.price}`);
      differences.push(`Price: ${plan1.currency} ${plan1.price} → ${plan2.currency} ${plan2.price}`);
    } else if (plan2.price > plan1.price) {
      differences.push(`Price: ${plan1.currency} ${plan1.price} → ${plan2.currency} ${plan2.price}`);
    }

    return { better, improvements, differences };
  }

  // Helper method to format price for display
  formatPrice(plan: FreemiumPlan): string {
    if (!plan) return "Free";
    if (plan.price === 0) return "Free";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(plan.price);
  }

  // Helper method to get plan features as readable list
  getPlanFeatures(plan: FreemiumPlan): string[] {
    const features: string[] = [];
    
    if (plan.quality_limit) {
      features.push(`Video quality: Up to ${plan.quality_limit}`);
    }
    
    if (plan.max_streams === -1) {
      features.push("Unlimited streams per day");
    } else if (plan.max_streams > 0) {
      features.push(`${plan.max_streams} streams per day`);
    }
    
    features.push(plan.ads ? "Contains ads" : "Ad-free experience");
    
    return features;
  }
}

export function createFreemiumClient(http: HttpClient): FreemiumClient {
  if (!http) {
    throw new Error("HttpClient is required to create FreemiumClient");
  }
  return new FreemiumClient(http);
}
