/**
 * Application-wide constants for pagination, caching, and performance tuning
 * Centralizes configuration for easy maintenance and optimization
 */

// ==================== PAGINATION CONSTANTS ====================

/**
 * Number of mentors to display per page in search/explore
 * Balance between: UX (not too few), Performance (not too many), Network (reasonable payload)
 * Recommended: 20-50 for desktop, 10-20 for mobile
 */
export const MENTORS_PER_PAGE = 20;

/**
 * Maximum number of sessions to load in mentor dashboard
 * Prevents memory issues for high-volume mentors
 */
export const MAX_SESSIONS_PER_LOAD = 100;

/**
 * Number of reviews to display per page
 */
export const REVIEWS_PER_PAGE = 10;

/**
 * Maximum notifications to show in notification bell
 */
export const MAX_NOTIFICATIONS = 5;

/**
 * Number of similar mentors to display
 */
export const SIMILAR_MENTORS_LIMIT = 20;

/**
 * Number of new mentors to display on homepage
 */
export const NEW_MENTORS_LIMIT = 8;

/**
 * Number of latest reviews to show in profile overview
 */
export const PROFILE_REVIEWS_PREVIEW = 3;

/**
 * Number of upcoming sessions to show in dashboard widget
 */
export const UPCOMING_SESSIONS_WIDGET = 3;

// ==================== CACHING CONSTANTS ====================

/**
 * Cache duration for time slot data (in milliseconds)
 * Time slots are cached to avoid redundant API calls when users navigate dates
 * 5 minutes is a good balance between freshness and performance
 */
export const TIME_SLOT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cache duration for mentor card data (in milliseconds)
 * Used with React Query or custom caching
 */
export const MENTOR_DATA_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const MENTOR_DATA_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Cache duration for session data
 */
export const SESSION_DATA_STALE_TIME = 2 * 60 * 1000; // 2 minutes
export const SESSION_DATA_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// ==================== SEARCH CONSTANTS ====================

/**
 * Debounce delay for search input (in milliseconds)
 * Waits this long after user stops typing before triggering search
 */
export const SEARCH_DEBOUNCE_DELAY = 500; // 0.5 seconds

/**
 * Minimum characters required to trigger search
 */
export const MIN_SEARCH_LENGTH = 2;

/**
 * Maximum search results to return from full-text search
 */
export const MAX_SEARCH_RESULTS = 100;

// ==================== BOOKING CONSTANTS ====================

/**
 * Number of dates to check initially for available slots
 * Higher = better chance of finding availability
 * Lower = faster initial load
 */
export const INITIAL_DATES_TO_CHECK = 14; // 2 weeks

/**
 * Number of dates visible in calendar week view
 */
export const CALENDAR_WEEK_DAYS = 7;

/**
 * Batch size for parallel date availability checks
 * Balance between speed and server load
 */
export const DATE_CHECK_BATCH_SIZE = 5;

/**
 * Delay before showing booking success modal (in milliseconds)
 */
export const BOOKING_SUCCESS_DELAY = 300;

// ==================== RATE LIMITING ====================

/**
 * Maximum API requests per second for search
 * Prevents overwhelming the database
 */
export const MAX_SEARCH_REQUESTS_PER_SECOND = 10;

/**
 * Maximum concurrent API calls for time slot fetching
 */
export const MAX_CONCURRENT_SLOT_REQUESTS = 10;

// ==================== DATABASE QUERY LIMITS ====================

/**
 * Maximum rows to fetch in a single query (safety limit)
 * Prevents accidentally loading entire tables
 */
export const MAX_QUERY_LIMIT = 1000;

/**
 * Default limit when no limit specified
 */
export const DEFAULT_QUERY_LIMIT = 50;

// ==================== UI/UX CONSTANTS ====================

/**
 * Toast notification duration (in milliseconds)
 */
export const TOAST_DURATION = 5000; // 5 seconds

/**
 * Loading animation minimum duration (prevents flash)
 */
export const MIN_LOADING_DURATION = 300;

/**
 * Infinite scroll trigger offset (pixels from bottom)
 */
export const INFINITE_SCROLL_OFFSET = 500;

/**
 * Skeleton loader count for initial page load
 */
export const SKELETON_MENTOR_CARDS = 8;

// ==================== PRICE RANGES ====================

/**
 * Default price range for filters
 */
export const DEFAULT_PRICE_RANGE: [number, number] = [0, 2000];

/**
 * Price range step for slider
 */
export const PRICE_RANGE_STEP = 50;

// ==================== FEATURE FLAGS ====================

/**
 * Enable/disable features for gradual rollout
 */
export const FEATURES = {
  FULL_TEXT_SEARCH: true, // Enable PostgreSQL FTS
  INFINITE_SCROLL: true, // Enable infinite scroll vs pagination
  TIME_SLOT_CACHE: true, // Enable time slot caching
  VIRTUAL_SCROLLING: false, // Not yet implemented
  OFFLINE_MODE: false, // Not yet implemented
  ANALYTICS: true, // Enable performance tracking
} as const;

// ==================== PERFORMANCE THRESHOLDS ====================

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE = {
  SLOW_QUERY_THRESHOLD: 1000, // Log queries taking > 1s
  LARGE_PAYLOAD_THRESHOLD: 1000000, // Log payloads > 1MB
  MEMORY_WARNING_THRESHOLD: 50000000, // Warn if memory > 50MB
} as const;

// ==================== VALIDATION CONSTANTS ====================

/**
 * Maximum lengths for user inputs
 */
export const MAX_LENGTHS = {
  BIO: 500,
  MESSAGE: 1000,
  REVIEW_COMMENT: 500,
  SESSION_PURPOSE: 300,
  USERNAME: 50,
  FULL_NAME: 100,
} as const;

/**
 * Minimum lengths for user inputs
 */
export const MIN_LENGTHS = {
  BIO: 50,
  MESSAGE: 10,
  PASSWORD: 8,
  USERNAME: 3,
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get page range for pagination
 */
export const getPageRange = (
  page: number,
  limit: number = MENTORS_PER_PAGE
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
};

/**
 * Calculate total pages
 */
export const getTotalPages = (
  total: number,
  limit: number = MENTORS_PER_PAGE
) => {
  return Math.ceil(total / limit);
};

/**
 * Check if cache is still valid
 */
export const isCacheValid = (
  timestamp: number,
  duration: number = TIME_SLOT_CACHE_DURATION
) => {
  return Date.now() - timestamp < duration;
};

/**
 * Throttle function calls
 */
export const shouldThrottle = (
  lastCallTime: number,
  minInterval: number = SEARCH_DEBOUNCE_DELAY
) => {
  return Date.now() - lastCallTime < minInterval;
};
