/**
 * Error Handler Utility
 * Centralized error handling with user-friendly messages
 */

interface ErrorResponse {
  code?: string;
  message?: string;
  details?: string;
}

export class ErrorHandler {
  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof Error) {
      // Network errors
      if (
        error.message.includes("Network") ||
        error.message.includes("network")
      ) {
        return "No internet connection. Please check your network.";
      }

      // Timeout errors
      if (
        error.message.includes("timeout") ||
        error.message.includes("Timeout")
      ) {
        return "Request timed out. Please try again.";
      }

      // Custom errors
      if (error instanceof ApiError) {
        return error.userMessage;
      }

      // Default
      return "Something went wrong. Please try again later.";
    }

    // Unknown error
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Get detailed log message for debugging
   */
  static getLogMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error instanceof ApiError) {
        return `[${error.code}] ${error.message} - Status: ${error.statusCode}`;
      }
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on 5xx errors and specific 4xx errors
      return (
        error.statusCode >= 500 ||
        error.statusCode === 408 ||
        error.statusCode === 429
      );
    }

    if (error instanceof Error) {
      // Retry on network errors
      return (
        error.message.includes("Network") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT")
      );
    }

    return false;
  }

  /**
   * Get HTTP status message
   */
  static getStatusMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      401: "Unauthorized. Please login again.",
      403: "You do not have permission to perform this action.",
      404: "The requested item was not found.",
      409: "Conflict. This item may have been modified.",
      422: "Invalid data. Please check your input.",
      429: "Too many requests. Please try again later.",
      500: "Server error. Please try again later.",
      502: "Bad gateway. Please try again.",
      503: "Service temporarily unavailable. Please try again later.",
      504: "Gateway timeout. Please try again.",
    };

    return messages[statusCode] || "An error occurred. Please try again.";
  }
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public userMessage: string,
    message?: string,
  ) {
    super(message || userMessage);
    this.name = "ApiError";
  }
}

/**
 * Network Error Class
 */
export class NetworkError extends Error {
  constructor(public readonly retryable = true) {
    super("Network error");
    this.name = "NetworkError";
  }
}

/**
 * Storage Error Class
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Validation Error Class
 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    message?: string,
  ) {
    super(message || `Invalid value for field: ${field}`);
    this.name = "ValidationError";
  }
}
