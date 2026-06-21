/**
 * Auth Storage
 * Persists the auth session: the user object here, and the tokens via the core
 * tokenStore (which the network layer reads to attach the Authorization header).
 *
 * storageService already JSON-serializes values, so the user object is stored
 * once and read back as an object (fixes the previous double-encoding).
 */

import { storageService } from "@/services";
import { tokenStore } from "@/services/session.token";
import { logger } from "@/utils/logger";
import type { AuthTokens, AuthUser } from "../types/auth.types";

const USER_KEY = "authUser";

export interface RestoredSession {
  user: AuthUser;
  token: string;
}

export const authStorage = {
  async save(user: AuthUser, tokens: AuthTokens): Promise<void> {
    await Promise.all([
      tokenStore.set(tokens),
      storageService.setItem(USER_KEY, user),
    ]);
  },

  async restore(): Promise<RestoredSession | null> {
    await tokenStore.hydrate();
    const [token, user] = [
      tokenStore.getAccessToken(),
      await storageService.getItem<AuthUser>(USER_KEY),
    ];

    if (!token || !user) {
      return null;
    }

    return { token, user };
  },

  /** Persist an updated user without touching tokens (e.g. after profile edit). */
  async saveUser(user: AuthUser): Promise<void> {
    await storageService.setItem(USER_KEY, user);
  },

  async clear(): Promise<void> {
    await Promise.all([
      tokenStore.clear(),
      storageService.removeItem(USER_KEY),
    ]);
    logger.info("Auth session cleared");
  },
};
