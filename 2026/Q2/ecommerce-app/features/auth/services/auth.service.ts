/**
 * Auth Service
 * Pure API calls for authentication. No Redux, no storage — just the network.
 * Every method resolves to the global ApiResponse<T> envelope.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import { appendImage } from "@/utils/form-data";
import type { AuthData, SignInPayload, SignUpPayload } from "../types/auth.types";

export const authService = {
  signIn: (payload: SignInPayload): Promise<ApiResponse<AuthData>> =>
    networkService.post<AuthData>("/auth/signIn", payload, {
      cache: false,
      retryCount: 1,
    }),

  /**
   * Signup is multipart (backend uses upload.single('image')). We always send
   * FormData so text fields + the optional avatar travel in one request.
   */
  signUp: (payload: SignUpPayload): Promise<ApiResponse<AuthData>> => {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("email", payload.email);
    form.append("password", payload.password);
    if (payload.address) {
      form.append("address", payload.address);
    }
    appendImage(form, "image", payload.image);

    return networkService.post<AuthData>("/auth/signUp", form, {
      cache: false,
      retryCount: 1,
    });
  },

  /** Soft-delete the authenticated user's account. */
  deleteAccount: (): Promise<ApiResponse<null>> =>
    networkService.delete<null>("/auth/account", { cache: false }),
};
