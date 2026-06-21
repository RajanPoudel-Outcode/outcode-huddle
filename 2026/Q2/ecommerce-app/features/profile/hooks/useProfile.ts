/**
 * useProfile
 * UI-facing facade for profile operations. Keeps local submit/error state
 * (per-screen) and, on a successful profile update, syncs the auth user into
 * Redux + persistent storage so the rest of the app reflects the change.
 */

import { authStorage } from "@/features/auth/services/auth.storage";
import type { AuthData, AuthUser } from "@/features/auth/types/auth.types";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUser } from "@/store/slices/authSlice";
import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useState } from "react";
import { profileService } from "../services/profile.service";
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "../types/profile.types";

export function useProfile() {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<AuthData> => {
    const res = await profileService.getProfile();
    return res.data.user;
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<string> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await profileService.updateProfile(payload);
        const u = res.data.user;
        const user: AuthUser = {
          id: u.id,
          email: u.email,
          name: u.name,
          avatar: u.image,
        };
        dispatch(setUser(user));
        await authStorage.saveUser(user);
        return res.message;
      } catch (err) {
        setError(ErrorHandler.getUserMessage(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch],
  );

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<string> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await profileService.changePassword(payload);
        return res.message;
      } catch (err) {
        setError(ErrorHandler.getUserMessage(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loadProfile,
    updateProfile,
    changePassword,
    isSubmitting,
    error,
    clearError,
  };
}
