/**
 * Session Token Store
 * Single source of truth for the auth tokens. Keeps an in-memory cache (so the
 * network layer can attach the Authorization header synchronously per request)
 * backed by AsyncStorage for persistence across launches.
 *
 * Lives in the core services layer (depends only on storageService) so both the
 * network service and the auth feature can use it without import cycles.
 */

import type { AuthTokens } from "@/features/auth/types/auth.types";
import { storageService } from "./storage.service";

const KEYS = {
  access: "authToken",
  refresh: "authRefreshToken",
} as const;

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStore = {
  /** Load tokens from storage into the in-memory cache (call on app launch). */
  async hydrate(): Promise<void> {
    accessToken = await storageService.getItem<string>(KEYS.access);
    refreshToken = await storageService.getItem<string>(KEYS.refresh);
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    return refreshToken;
  },

  /** Persist a fresh token pair (after sign in / sign up / refresh). */
  async set(tokens: AuthTokens): Promise<void> {
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    await Promise.all([
      storageService.setItem(KEYS.access, tokens.access_token),
      storageService.setItem(KEYS.refresh, tokens.refresh_token),
    ]);
  },

  /** Persist only a new access token (after a refresh that keeps the refresh token). */
  async setAccessToken(token: string): Promise<void> {
    accessToken = token;
    await storageService.setItem(KEYS.access, token);
  },

  async clear(): Promise<void> {
    accessToken = null;
    refreshToken = null;
    await Promise.all([
      storageService.removeItem(KEYS.access),
      storageService.removeItem(KEYS.refresh),
    ]);
  },
};
