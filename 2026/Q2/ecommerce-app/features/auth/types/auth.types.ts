/**
 * Auth Feature Types
 */

import type { PickedImage } from "@/types/upload.types";

/** Token pair returned by the auth endpoints. */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Shape of the `data` field returned by `/auth/signIn` and `/auth/signUp`.
 */
export interface AuthData {
  id: string;
  name: string;
  email: string;
  address?: string;
  type: string;
  image?: string;
  token: AuthTokens;
  createdAt: string;
  updatedAt: string;
}

/** Trimmed user object kept in Redux and persistent storage. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

/** Matches the backend signup schema: single `name`, optional `address`/`image`. */
export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  address?: string;
  image?: PickedImage;
}
