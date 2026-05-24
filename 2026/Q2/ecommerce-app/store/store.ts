/**
 * Redux Store Configuration
 * Configure store with all slices and middleware
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import onboardingReducer from "./slices/onboardingSlice";
import productsReducer from "./slices/productsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    onboarding: onboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable errors for auth.setToken action
        ignoredActions: ["auth/setToken"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
