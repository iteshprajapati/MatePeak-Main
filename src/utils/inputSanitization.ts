/**
 * Input Sanitization & Validation Utilities
 * Prevents XSS, SQL injection, and malicious inputs
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format and prevent javascript: protocol
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ["http:", "https:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars
    .replace(/\.{2,}/g, ".") // Prevent ..
    .slice(0, 255); // Limit length
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize user profile data
 */
export function sanitizeProfileData(data: any) {
  return {
    full_name: sanitizeInput(data.full_name || "").slice(0, 100),
    bio: sanitizeInput(data.bio || "").slice(0, 500),
    phone: data.phone ? sanitizeInput(data.phone).slice(0, 20) : null,
    linkedin: data.linkedin && isValidUrl(data.linkedin) ? data.linkedin : null,
    twitter: data.twitter && isValidUrl(data.twitter) ? data.twitter : null,
  };
}

/**
 * Validate booking message
 */
export function validateBookingMessage(message: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 1000) {
    return { valid: false, error: "Message too long (max 1000 characters)" };
  }

  if (containsSqlInjection(message)) {
    return { valid: false, error: "Invalid characters detected" };
  }

  return {
    valid: true,
    sanitized: sanitizeInput(message),
  };
}

/**
 * Validate review comment
 */
export function validateReviewComment(comment: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!comment || comment.trim().length === 0) {
    return { valid: false, error: "Comment cannot be empty" };
  }

  if (comment.length > 500) {
    return { valid: false, error: "Comment too long (max 500 characters)" };
  }

  if (comment.length < 10) {
    return { valid: false, error: "Comment too short (min 10 characters)" };
  }

  if (containsSqlInjection(comment)) {
    return { valid: false, error: "Invalid characters detected" };
  }

  return {
    valid: true,
    sanitized: sanitizeInput(comment),
  };
}

/**
 * Prevent prototype pollution
 */
export function sanitizeObject(obj: any): any {
  const sanitized: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Prevent __proto__, constructor, prototype pollution
      if (["__proto__", "constructor", "prototype"].includes(key)) {
        continue;
      }

      const value = obj[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}
