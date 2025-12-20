/**
 * Rate Limiting Service
 * Prevents abuse and ensures platform stability
 */

import { supabase } from "@/integrations/supabase/client";

export type RateLimitAction =
  | "booking_create"
  | "booking_request"
  | "message_send"
  | "review_create"
  | "search_query"
  | "profile_update"
  | "api_call";

export interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  max_requests: number;
  time_window_minutes: number;
  remaining?: number;
  retry_after_seconds?: number;
  message?: string;
}

export interface RateLimitStatus {
  action_type: string;
  current_count: number;
  max_requests: number;
  remaining: number;
  time_window_minutes: number;
  resets_at: string;
}

/**
 * Check if user can perform an action based on rate limits
 */
export async function checkRateLimit(
  action: RateLimitAction,
  userId?: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  try {
    // Get user ID from session if not provided
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // Get IP address from browser if not provided (fallback)
    if (!ipAddress) {
      ipAddress = await getClientIP();
    }

    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_user_id: userId || null,
      p_ip_address: ipAddress || null,
      p_action_type: action,
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      // On error, allow the action (fail open)
      return {
        allowed: true,
        current_count: 0,
        max_requests: 1000,
        time_window_minutes: 60,
        remaining: 1000,
      };
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error("Rate limit service error:", error);
    // On error, allow the action (fail open)
    return {
      allowed: true,
      current_count: 0,
      max_requests: 1000,
      time_window_minutes: 60,
      remaining: 1000,
    };
  }
}

/**
 * Get rate limit status for a user
 */
export async function getRateLimitStatus(
  action: RateLimitAction,
  userId?: string
): Promise<RateLimitStatus | null> {
  try {
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase.rpc("get_rate_limit_status", {
      p_user_id: userId,
      p_action_type: action,
    });

    if (error) {
      console.error("Failed to get rate limit status:", error);
      return null;
    }

    return data as RateLimitStatus;
  } catch (error) {
    console.error("Rate limit status error:", error);
    return null;
  }
}

/**
 * Enforce rate limit - throws error if limit exceeded
 */
export async function enforceRateLimit(
  action: RateLimitAction,
  userId?: string,
  ipAddress?: string
): Promise<void> {
  const result = await checkRateLimit(action, userId, ipAddress);

  if (!result.allowed) {
    const error = new Error(
      result.message ||
        `Rate limit exceeded. Please try again in ${Math.ceil(
          (result.retry_after_seconds || 60) / 60
        )} minutes.`
    );
    (error as any).rateLimitInfo = result;
    throw error;
  }
}

/**
 * Get client IP address (best effort)
 */
async function getClientIP(): Promise<string> {
  try {
    // In production, this would be set by your edge function/API gateway
    // For now, return a placeholder
    return "browser-client";
  } catch {
    return "unknown";
  }
}

/**
 * Rate limit decorator for functions
 */
export function withRateLimit(action: RateLimitAction) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      await enforceRateLimit(action);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Client-side rate limiting (for immediate feedback)
 */
class ClientRateLimiter {
  private cache: Map<string, { count: number; resetAt: number }> = new Map();

  check(action: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = action;
    const entry = this.cache.get(key);

    if (!entry || now > entry.resetAt) {
      this.cache.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  reset(action: string): void {
    this.cache.delete(action);
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * Rate limit configurations for client-side checks
 */
export const RATE_LIMITS = {
  booking_create: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  booking_request: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  message_send: { max: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
  review_create: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  search_query: { max: 100, windowMs: 60 * 1000 }, // 100 per minute
  profile_update: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  api_call: { max: 60, windowMs: 60 * 1000 }, // 60 per minute
} as const;
