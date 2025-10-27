/**
 * Utility functions for network connectivity and error handling
 */

/**
 * Check if the user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Check if error is a network-related error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const networkErrorKeywords = [
    'fetch',
    'network',
    'connection',
    'timeout',
    'offline',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CONNECTION_REFUSED'
  ];
  
  return networkErrorKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: any): string {
  if (!isOnline()) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }
  
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  return error?.message || 'An unexpected error occurred.';
}

/**
 * Retry a function with exponential backoff for network errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a network error
      if (!isNetworkError(error)) {
        throw error;
      }
      
      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}