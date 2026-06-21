/**
 * Profile Service
 * Pure API calls for the authenticated user's profile. The network layer
 * attaches the Authorization header automatically.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import { appendImage } from "@/utils/form-data";
import type {
  ChangePasswordPayload,
  ProfileResponse,
  UpdateProfilePayload,
} from "../types/profile.types";

export const profileService = {
  getProfile: (): Promise<ApiResponse<ProfileResponse>> =>
    networkService.get<ProfileResponse>("/auth/profile", undefined, {
      cache: false,
    }),

  /** PUT /auth/profile is multipart (optional `image`). Only changed fields are sent. */
  updateProfile: (
    payload: UpdateProfilePayload,
  ): Promise<ApiResponse<ProfileResponse>> => {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.email !== undefined) form.append("email", payload.email);
    if (payload.address !== undefined) form.append("address", payload.address);
    appendImage(form, "image", payload.image);

    return networkService.put<ProfileResponse>("/auth/profile", form, {
      retryCount: 1,
    });
  },

  changePassword: (
    payload: ChangePasswordPayload,
  ): Promise<ApiResponse<null>> =>
    networkService.post<null>("/auth/change-password", payload, {
      cache: false,
      retryCount: 1,
    }),
};
