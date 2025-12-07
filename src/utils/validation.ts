/**
 * Centralized validation utilities
 * Eliminates duplicate validation logic across forms
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Calculate strength
  if (errors.length === 0 && password.length >= 12) {
    strength = "strong";
  } else if (errors.length <= 1) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate price range
 */
export function isValidPrice(
  price: number,
  min: number = 0,
  max: number = 100000
): boolean {
  return price >= min && price <= max && !isNaN(price);
}

/**
 * Validate text length
 */
export function isValidLength(text: string, min: number, max: number): boolean {
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate form field
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateField(
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    customError?: string;
  }
): ValidationResult {
  if (rules.required && !value) {
    return { isValid: false, error: "This field is required" };
  }

  if (rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      error: `Minimum length is ${rules.minLength} characters`,
    };
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      error: `Maximum length is ${rules.maxLength} characters`,
    };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, error: "Invalid format" };
  }

  if (rules.custom && !rules.custom(value)) {
    return {
      isValid: false,
      error: rules.customError || "Invalid value",
    };
  }

  return { isValid: true };
}
