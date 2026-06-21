/**
 * Validators Utility
 * Common validation functions
 */

export class Validators {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
   */
  static isValidPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain an uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain a lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain a digit");
    }
    // Must match the backend's allowed special characters: @$!%*?&
    if (!/[@$!%*?&]/.test(password)) {
      errors.push("Password must contain a special character (@$!%*?&)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate phone number (US format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex =
      /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate credit card number (Luhn algorithm)
   */
  static isValidCreditCard(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate not empty
   */
  static isNotEmpty(value: unknown): boolean {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  /**
   * Validate minimum length
   */
  static hasMinLength(value: string, min: number): boolean {
    return value.length >= min;
  }

  /**
   * Validate maximum length
   */
  static hasMaxLength(value: string, max: number): boolean {
    return value.length <= max;
  }

  /**
   * Validate number range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}
