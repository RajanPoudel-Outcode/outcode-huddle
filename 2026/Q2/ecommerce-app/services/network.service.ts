/**
 * Network Service
 * Handle API calls with offline support, retry logic, and error handling
 */

import Config from "@/constants/config";
import { ApiError, ErrorHandler, NetworkError } from "@/utils/error-handler";
import { logger } from "@/utils/logger";
import { storageService } from "./storage.service";

interface NetworkRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
  retryCount?: number;
}

interface NetworkResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class NetworkService {
  private static instance: NetworkService;
  private baseURL: string;
  private readonly DEFAULT_TIMEOUT = 10000;
  private readonly DEFAULT_RETRIES = 3;
  private readonly DEFAULT_CACHE_TTL = 3600000; // 1 hour
  private isOnline = true;
  private requestCount = 0;

  private constructor() {
    this.baseURL = Config.api.baseURL;
    this.setupNetworkListener();
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    try {
      // Use NetInfo to detect network status
      // This would be integrated with your app's network detection
      logger.info("Network service initialized");
    } catch (error) {
      logger.error("Failed to setup network listener", error);
    }
  }

  /**
   * Set base URL for API
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Get current online status
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Set online status
   */
  setOnlineStatus(online: boolean): void {
    if (this.isOnline !== online) {
      this.isOnline = online;
      logger.info(`Network status changed: ${online ? "online" : "offline"}`);

      if (online) {
        this.syncOfflineRequests();
      }
    }
  }

  /**
   * Make GET request
   */
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: NetworkRequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint, params);
    return this.request<T>("GET", url, undefined, options);
  }

  /**
   * Make POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: NetworkRequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    return this.request<T>("POST", url, data, options);
  }

  /**
   * Make PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: NetworkRequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    return this.request<T>("PUT", url, data, options);
  }

  /**
   * Make PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: NetworkRequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    return this.request<T>("PATCH", url, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: NetworkRequestOptions,
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    return this.request<T>("DELETE", url, undefined, options);
  }

  /**
   * Core request implementation with retry and offline logic
   */
  private async request<T = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: unknown,
    options: NetworkRequestOptions = {},
  ): Promise<T> {
    const {
      headers = {},
      timeout = this.DEFAULT_TIMEOUT,
      cache = method === "GET",
      cacheTTL = this.DEFAULT_CACHE_TTL,
      retryCount = this.DEFAULT_RETRIES,
    } = options;

    // Check cache for GET requests
    if (method === "GET" && cache) {
      const cached = await storageService.getCache<T>(url);
      if (cached) {
        return cached;
      }
    }

    // If offline, try cache or queue
    if (!this.isOnline) {
      logger.warn(`Offline: ${method} ${url}`);

      if (method === "GET") {
        const cached = await storageService.getCache<T>(url);
        if (cached) {
          return cached;
        }
      } else {
        // Queue non-GET requests
        await storageService.queueRequest({
          method,
          url,
          data,
          headers,
          retries: 0,
        });
        throw new NetworkError(true);
      }

      throw new NetworkError(true);
    }

    // Try to make request with retries
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await this.makeRequest<T>(
          method,
          url,
          data,
          {
            ...headers,
            "Content-Type": "application/json",
          },
          timeout,
        );

        // Cache successful GET responses
        if (method === "GET" && cache) {
          await storageService.setCache(url, response.data, cacheTTL);
        }

        logger.info(`Success: ${method} ${url}`, { status: response });
        return response.data;
      } catch (error) {
        lastError = error as Error;

        if (!ErrorHandler.isRetryable(error) || attempt === retryCount) {
          break;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn(`Retry ${attempt + 1}/${retryCount} after ${delay}ms`, {
          method,
          url,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If all retries failed, queue or throw
    if (!ErrorHandler.isRetryable(lastError)) {
      throw lastError;
    }

    if (method !== "GET") {
      await storageService.queueRequest({
        method,
        url,
        data,
        headers,
        retries: 0,
      });
    }

    throw lastError || new NetworkError(true);
  }

  /**
   * Make actual HTTP request
   */
  private async makeRequest<T>(
    method: string,
    url: string,
    data: unknown,
    headers: Record<string, string>,
    timeout: number,
  ): Promise<NetworkResponse<T>> {
    this.requestCount++;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && method !== "GET") {
        options.body = JSON.stringify(data);
        logger.debug(`Request Body [${method} ${url}]`, data);
      }

      // Log outgoing request headers
      logger.debug(`Request Headers [${method} ${url}]`, headers);

      const response = await fetch(url, options);
      const responseData = await response.json();

      // Extract response headers
      const responseHeaders = Object.fromEntries(response.headers.entries());

      // Log response headers and status
      logger.debug(`Response Headers [${method} ${url}]`, {
        status: response.status,
        headers: responseHeaders,
      });

      // Handle error response from API
      if (responseData.error || !response.ok) {
        const errorMessage =
          responseData.message ||
          ErrorHandler.getStatusMessage(response.status);
        throw new ApiError(
          responseData.status_code || response.status,
          `HTTP_${response.status}`,
          errorMessage,
          `${method} ${url} - ${response.status}`,
        );
      }

      // Extract data from API response format
      const data_from_response = responseData.data || responseData;

      return {
        data: data_from_response as T,
        status: response.status,
        headers: responseHeaders,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new NetworkError(true);
      }

      logger.error("Network request failed", error);
      throw new NetworkError(true);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build full URL with params
   */
  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    const url = new URL(cleanEndpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Sync offline requests when back online
   */
  private async syncOfflineRequests(): Promise<void> {
    logger.info("Syncing offline requests...");
    // Implementation would sync queued requests
  }

  /**
   * Get network stats
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      isOnline: this.isOnline,
    };
  }
}

export const networkService = NetworkService.getInstance();
