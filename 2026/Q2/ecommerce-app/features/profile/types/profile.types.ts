/**
 * Profile Feature Types
 */

import type { AuthData } from "@/features/auth/types/auth.types";
import type { PickedImage } from "@/types/upload.types";

/** The backend wraps the profile user object as { user }. */
export interface ProfileResponse {
  user: AuthData;
}

/** All fields optional — only changed fields are sent (matches updateProfileSchema). */
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  address?: string;
  image?: PickedImage;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
