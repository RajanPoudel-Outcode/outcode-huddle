/**
 * Network Service
 * Handle API calls with offline support, retry logic, and error handling
 */

import Config from "@/constants/config";
import type { ApiResponse } from "@/types/api.types";
import { ApiError, ErrorHandler, NetworkError } from "@/utils/error-handler";
import { logger } from "@/utils/logger";
import { tokenStore } from "./session.token";
import { storageService } from "./storage.service";

interface NetworkRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
  retryCount?: number;
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
  ): Promise<ApiResponse<T>> {
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
  ): Promise<ApiResponse<T>> {
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
  ): Promise<ApiResponse<T>> {
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
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.request<T>("PATCH", url, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: NetworkRequestOptions,
  ): Promise<ApiResponse<T>> {
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
  ): Promise<ApiResponse<T>> {
    const {
      headers = {},
      timeout = this.DEFAULT_TIMEOUT,
      cache = method === "GET",
      cacheTTL = this.DEFAULT_CACHE_TTL,
      retryCount = this.DEFAULT_RETRIES,
    } = options;

    // Check cache for GET requests
    if (method === "GET" && cache) {
      const cached = await storageService.getCache<ApiResponse<T>>(url);
      if (cached) {
        return cached;
      }
    }

    // If offline, try cache or queue
    if (!this.isOnline) {
      logger.warn(`Offline: ${method} ${url}`);

      if (method === "GET") {
        const cached = await storageService.getCache<ApiResponse<T>>(url);
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
          { ...headers },
          timeout,
        );

        // Cache successful GET responses (full envelope)
        if (method === "GET" && cache) {
          await storageService.setCache(url, response, cacheTTL);
        }

        logger.info(`Success: ${method} ${url}`, { message: response.message });
        return response;
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
    isRetryAfterRefresh = false,
  ): Promise<ApiResponse<T>> {
    this.requestCount++;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // FormData (file uploads): let fetch set the multipart boundary itself.
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const finalHeaders: Record<string, string> = { ...headers };
    if (data && method !== "GET" && !isFormData) {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] ?? "application/json";
    }

    // Attach the bearer token for authenticated endpoints.
    const accessToken = tokenStore.getAccessToken();
    if (accessToken) {
      finalHeaders["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const options: RequestInit = {
        method,
        headers: finalHeaders,
        signal: controller.signal,
      };

      if (data && method !== "GET") {
        options.body = isFormData ? (data as FormData) : JSON.stringify(data);
      }

      // Log response status
      const response = await fetch(url, options);
      const body = await response.json();
      logger.debug(`Response [${method} ${url}]`, { status: response.status });

      // Handle error envelope: { error: true, message, status_code, path, method }
      if (body.error || !response.ok) {
        const status = body.status_code ?? response.status;

        // Expired/invalid access token: refresh once, then retry the request.
        const lowerUrl = url.toLowerCase();
        const isAuthEndpoint =
          lowerUrl.includes("/auth/refresh-token") ||
          lowerUrl.includes("/auth/signin") ||
          lowerUrl.includes("/auth/signup");
        if (status === 401 && !isRetryAfterRefresh && !isAuthEndpoint) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            clearTimeout(timeoutId);
            return this.makeRequest<T>(method, url, data, headers, timeout, true);
          }
        }

        const errorMessage =
          body.message || ErrorHandler.getStatusMessage(response.status);
        throw new ApiError(
          status,
          `HTTP_${response.status}`,
          errorMessage,
          `${body.method ?? method} ${body.path ?? url} - ${status}`,
        );
      }

      // Return the full success envelope: { success, message, data, meta }
      return body as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new NetworkError(true);
      }

      logger.error("Network request failed", error);
      throw new NetworkError(true);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Exchange the refresh token for a new token pair. Returns true on success.
   * Uses a raw fetch (not the public methods) to avoid recursion/caching.
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refresh = tokenStore.getRefreshToken();
    if (!refresh) {
      return false;
    }

    try {
      const url = this.buildURL("/auth/refresh-token");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      const body = await response.json();

      if (!response.ok || body.error) {
        logger.warn("Token refresh failed");
        return false;
      }

      // refresh-token returns the user object (flat) with a fresh `token` pair.
      const tokens = body?.data?.token;
      if (tokens?.access_token && tokens?.refresh_token) {
        await tokenStore.set(tokens);
        logger.info("Access token refreshed");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Token refresh error", error);
      return false;
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
