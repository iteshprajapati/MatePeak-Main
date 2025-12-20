/**
 * Performance Monitoring & Optimization Utilities
 */

/**
 * Monitor component render performance
 */
export function measureRender(componentName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) {
    // More than one frame (60fps = 16.67ms)
    console.warn(
      `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
    );
  }
}

/**
 * Monitor API call performance
 */
export async function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - start;

    // Log slow queries
    if (duration > 1000) {
      console.warn(`[Performance] ${apiName} took ${duration.toFixed(2)}ms`);
    }

    // Send to analytics if configured
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "timing_complete", {
        name: apiName,
        value: Math.round(duration),
        event_category: "API Performance",
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[Performance] ${apiName} failed after ${duration.toFixed(2)}ms`,
      error
    );
    throw error;
  }
}

/**
 * Debounce function for search/input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    });

    if (placeholder) {
      img.src = placeholder;
    }
    observer.observe(img);
  } else {
    // Fallback for older browsers
    img.src = src;
  }
}

/**
 * Memory usage monitoring
 */
export function checkMemoryUsage() {
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1048576;
    const limitMB = memory.jsHeapSizeLimit / 1048576;
    const percentUsed = (usedMB / limitMB) * 100;

    if (percentUsed > 80) {
      console.warn(
        `[Performance] High memory usage: ${usedMB.toFixed(
          2
        )}MB / ${limitMB.toFixed(2)}MB (${percentUsed.toFixed(1)}%)`
      );
    }

    return {
      used: usedMB,
      limit: limitMB,
      percent: percentUsed,
    };
  }

  return null;
}

/**
 * Network information
 */
export function getNetworkInfo() {
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', etc.
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // Round trip time in ms
      saveData: connection.saveData, // Boolean
    };
  }
  return null;
}

/**
 * Check if user is on slow connection
 */
export function isSlowConnection(): boolean {
  const network = getNetworkInfo();
  if (!network) return false;

  return (
    network.saveData ||
    network.effectiveType === "slow-2g" ||
    network.effectiveType === "2g" ||
    network.rtt > 1000 // High latency
  );
}

/**
 * Bundle size monitoring
 */
export function logBundleSize() {
  if (typeof window !== "undefined") {
    const resources = performance.getEntriesByType("resource");
    let totalSize = 0;

    resources.forEach((resource: any) => {
      if (resource.name.includes(".js") || resource.name.includes(".css")) {
        totalSize += resource.transferSize || 0;
      }
    });

    console.log(
      `[Performance] Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`
    );
  }
}

/**
 * Report Web Vitals
 */
export function reportWebVitals() {
  if (typeof window !== "undefined" && "PerformanceObserver" in window) {
    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        console.log("[LCP]", lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          console.log("[FID]", entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsScore = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log("[CLS]", clsScore);
      }).observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // CLS not supported
    }
  }
}
