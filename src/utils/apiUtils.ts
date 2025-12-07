/**
 * Centralized API error handling and response formatting
 * Provides consistent error handling across all service calls
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Handle Supabase errors and return standardized response
 */
export function handleSupabaseError(error: any): ApiResponse {
  console.error("Supabase error:", error);

  let errorMessage = "An unexpected error occurred";

  if (error?.message) {
    // Common Supabase errors
    if (error.message.includes("duplicate key")) {
      errorMessage = "This record already exists";
    } else if (error.message.includes("violates foreign key")) {
      errorMessage = "Invalid reference to related data";
    } else if (error.message.includes("violates check constraint")) {
      errorMessage = "Invalid data provided";
    } else if (error.message.includes("permission denied")) {
      errorMessage = "You do not have permission to perform this action";
    } else if (error.message.includes("not found")) {
      errorMessage = "Record not found";
    } else if (error.message.includes("rate limit")) {
      errorMessage = "Too many requests. Please try again later";
    } else {
      errorMessage = error.message;
    }
  }

  return {
    success: false,
    error: errorMessage,
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create error response
 */
export function createErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
  };
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: any): ApiResponse {
  if (!navigator.onLine) {
    return createErrorResponse(
      "No internet connection. Please check your network"
    );
  }

  if (error?.name === "AbortError") {
    return createErrorResponse("Request timed out. Please try again");
  }

  return createErrorResponse("Network error. Please try again");
}

/**
 * Log error for monitoring
 */
export function logError(
  context: string,
  error: any,
  metadata?: Record<string, any>
) {
  const errorLog = {
    context,
    error: error?.message || error,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  console.error(`[${context}]`, errorLog);

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { contexts: { custom: errorLog } });
  }
}

/**
 * Validate API response
 */
export function validateResponse<T>(
  response: any,
  validator: (data: any) => boolean
): ApiResponse<T> {
  if (!response) {
    return createErrorResponse("No response from server");
  }

  if (!validator(response)) {
    return createErrorResponse("Invalid response format");
  }

  return createSuccessResponse(response);
}
