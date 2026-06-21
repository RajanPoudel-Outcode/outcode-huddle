/**
 * Auth Slice
 * Handles authentication state. Async work lives in thunks that orchestrate the
 * auth service + persistent storage; reducers only hold state.
 */

import { authService } from "@/features/auth/services/auth.service";
import { authStorage } from "@/features/auth/services/auth.storage";
import type {
  AuthUser,
  SignInPayload,
  SignUpPayload,
} from "@/features/auth/types/auth.types";
import { ErrorHandler } from "@/utils/error-handler";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

interface AuthSuccess {
  user: AuthUser;
  token: string;
  message: string;
}

/**
 * Sign in: call API, persist session, return the trimmed user + server message.
 * On failure, reject with a user-friendly message (verbatim backend message
 * where available).
 */
export const signIn = createAsyncThunk<AuthSuccess, SignInPayload>(
  "auth/signIn",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.signIn(payload);
      const user: AuthUser = {
        id: res.data.id,
        email: res.data.email,
        name: res.data.name,
        avatar: res.data.image,
      };
      await authStorage.save(user, res.data.token);
      return { user, token: res.data.token.access_token, message: res.message };
    } catch (err) {
      return rejectWithValue(ErrorHandler.getUserMessage(err));
    }
  },
);

export const signUp = createAsyncThunk<AuthSuccess, SignUpPayload>(
  "auth/signUp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authService.signUp(payload);
      const user: AuthUser = {
        id: res.data.id,
        email: res.data.email,
        name: res.data.name,
        avatar: res.data.image,
      };
      await authStorage.save(user, res.data.token);
      return { user, token: res.data.token.access_token, message: res.message };
    } catch (err) {
      return rejectWithValue(ErrorHandler.getUserMessage(err));
    }
  },
);

/** Restore a persisted session on app launch. */
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    return authStorage.restore();
  },
);

/** Clear the persisted session, then reset auth state via the reducer. */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    await authStorage.clear();
    dispatch(logout());
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.isLoading = true;
      state.error = null;
    };
    const fulfilled = (state: AuthState, action: PayloadAction<AuthSuccess>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    };
    const rejected = (
      state: AuthState,
      action: { payload?: unknown; error: { message?: string } },
    ) => {
      state.isLoading = false;
      state.error =
        (action.payload as string) ??
        action.error.message ??
        "Something went wrong. Please try again.";
    };

    builder
      .addCase(signIn.pending, pending)
      .addCase(signIn.fulfilled, fulfilled)
      .addCase(signIn.rejected, rejected)
      .addCase(signUp.pending, pending)
      .addCase(signUp.fulfilled, fulfilled)
      .addCase(signUp.rejected, rejected)
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { setUser, setToken, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;
