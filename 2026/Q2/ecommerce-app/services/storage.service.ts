/**
 * Storage Service
 * Handle AsyncStorage with caching and TTL support
 */

import { StorageError } from "@/utils/error-handler";
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

interface QueuedRequest {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  retries: number;
  createdAt: number;
}

export class StorageService {
  private static instance: StorageService;
  private readonly CACHE_PREFIX = "cache:";
  private readonly QUEUE_PREFIX = "queue:";
  private readonly STATE_PREFIX = "state:";
  private readonly REQUESTS_KEY = "offline_requests";

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Save data to storage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
      logger.debug(`Stored: ${key}`, { size: serialized.length });
    } catch (error) {
      logger.error(`Failed to store ${key}`, error);
      throw new StorageError(`Failed to store data: ${key}`);
    }
  }

  /**
   * Retrieve data from storage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      logger.error(`Failed to retrieve ${key}`, error);
      throw new StorageError(`Failed to retrieve data: ${key}`);
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      logger.debug(`Removed: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove ${key}`, error);
      throw new StorageError(`Failed to remove data: ${key}`);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      logger.info("Storage cleared");
    } catch (error) {
      logger.error("Failed to clear storage", error);
      throw new StorageError("Failed to clear storage");
    }
  }

  /**
   * Save to cache with TTL
   */
  async setCache<T>(
    key: string,
    value: T,
    ttlMs: number = 3600000,
  ): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      await this.setItem(cacheKey, entry);
      logger.debug(`Cached: ${key}`, { ttl: ttlMs });
    } catch (error) {
      logger.error(`Failed to cache ${key}`, error);
      throw error;
    }
  }

  /**
   * Get from cache if not expired
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const entry = await this.getItem<CacheEntry<T>>(cacheKey);

      if (!entry) {
        return null;
      }

      // Check if expired
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        await this.removeItem(cacheKey);
        logger.debug(`Cache expired: ${key}`);
        return null;
      }

      logger.debug(`Cache hit: ${key}`, { age });
      return entry.data;
    } catch (error) {
      logger.error(`Failed to get cache ${key}`, error);
      return null;
    }
  }

  /**
   * Clear cache for a key
   */
  async clearCache(key: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      await this.removeItem(cacheKey);
      logger.debug(`Cache cleared: ${key}`);
    } catch (error) {
      logger.error(`Failed to clear cache ${key}`, error);
    }
  }

  /**
   * Queue a request for offline retry
   */
  async queueRequest(
    request: Omit<QueuedRequest, "id" | "createdAt">,
  ): Promise<string> {
    try {
      const id = `${Date.now()}-${Math.random()}`;
      const queuedRequest: QueuedRequest = {
        ...request,
        id,
        createdAt: Date.now(),
      };

      let queue =
        (await this.getItem<QueuedRequest[]>(this.REQUESTS_KEY)) || [];
      queue.push(queuedRequest);
      await this.setItem(this.REQUESTS_KEY, queue);

      logger.info(`Queued request: ${id}`, {
        method: request.method,
        url: request.url,
      });
      return id;
    } catch (error) {
      logger.error("Failed to queue request", error);
      throw error;
    }
  }

  /**
   * Get all queued requests
   */
  async getQueuedRequests(): Promise<QueuedRequest[]> {
    try {
      const queue = await this.getItem<QueuedRequest[]>(this.REQUESTS_KEY);
      return queue || [];
    } catch (error) {
      logger.error("Failed to get queued requests", error);
      return [];
    }
  }

  /**
   * Remove queued request
   */
  async removeQueuedRequest(id: string): Promise<void> {
    try {
      let queue =
        (await this.getItem<QueuedRequest[]>(this.REQUESTS_KEY)) || [];
      queue = queue.filter((req) => req.id !== id);
      await this.setItem(this.REQUESTS_KEY, queue);
      logger.debug(`Removed queued request: ${id}`);
    } catch (error) {
      logger.error(`Failed to remove queued request ${id}`, error);
    }
  }

  /**
   * Update queued request retries
   */
  async updateQueuedRequestRetries(id: string, retries: number): Promise<void> {
    try {
      let queue =
        (await this.getItem<QueuedRequest[]>(this.REQUESTS_KEY)) || [];
      const request = queue.find((req) => req.id === id);
      if (request) {
        request.retries = retries;
        await this.setItem(this.REQUESTS_KEY, queue);
      }
    } catch (error) {
      logger.error(`Failed to update queued request ${id}`, error);
    }
  }

  /**
   * Save Redux state
   */
  async saveState(key: string, state: unknown): Promise<void> {
    try {
      const stateKey = `${this.STATE_PREFIX}${key}`;
      await this.setItem(stateKey, state);
      logger.debug(`Saved state: ${key}`);
    } catch (error) {
      logger.error(`Failed to save state ${key}`, error);
    }
  }

  /**
   * Restore Redux state
   */
  async restoreState<T>(key: string): Promise<T | null> {
    try {
      const stateKey = `${this.STATE_PREFIX}${key}`;
      return await this.getItem<T>(stateKey);
    } catch (error) {
      logger.error(`Failed to restore state ${key}`, error);
      return null;
    }
  }

  /**
   * Get storage size (approximate)
   */
  async getSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const item = await AsyncStorage.getItem(key);
        totalSize += item ? item.length : 0;
      }

      return totalSize;
    } catch (error) {
      logger.error("Failed to get storage size", error);
      return 0;
    }
  }
}

export const storageService = StorageService.getInstance();
