/**
 * useAuth
 * UI-facing facade over the auth slice. Screens use this instead of touching
 * the network/storage services or dispatching auth actions directly.
 */

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import {
  logoutUser,
  setError,
  signIn,
  signUp,
} from "@/store/slices/authSlice";
import { useCallback } from "react";
import { authService } from "../services/auth.service";
import type { SignInPayload, SignUpPayload } from "../types/auth.types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const isAuthenticated = useAppSelector(
    (s: RootState) => s.auth.isAuthenticated,
  );
  const isLoading = useAppSelector((s: RootState) => s.auth.isLoading);
  const error = useAppSelector((s: RootState) => s.auth.error);

  // `.unwrap()` resolves to { user, token, message } or throws the rejected
  // value, letting callers read the success message / handle failure locally.
  const signInUser = useCallback(
    (payload: SignInPayload) => dispatch(signIn(payload)).unwrap(),
    [dispatch],
  );

  const signUpUser = useCallback(
    (payload: SignUpPayload) => dispatch(signUp(payload)).unwrap(),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutUser()).unwrap(), [dispatch]);

  // Soft-delete the account on the server, then clear the local session.
  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount();
    await dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  const clearError = useCallback(() => dispatch(setError(null)), [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn: signInUser,
    signUp: signUpUser,
    logout,
    deleteAccount,
    clearError,
  };
}
