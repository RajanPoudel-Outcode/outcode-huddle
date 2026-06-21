/**
 * Redux Store Configuration
 * Configure store with all slices and middleware
 */

import { storageService } from "@/services";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import onboardingReducer from "./slices/onboardingSlice";
import productsReducer from "./slices/productsSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const CART_STORAGE_KEY = "cart";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    onboarding: onboardingReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable errors for auth.setToken action
        ignoredActions: ["auth/setToken"],
      },
    }),
});

// Persist the cart to storage whenever it changes (rehydrated on app launch).
let prevCartItems = store.getState().cart.items;
store.subscribe(() => {
  const items = store.getState().cart.items;
  if (items !== prevCartItems) {
    prevCartItems = items;
    void storageService.setItem(CART_STORAGE_KEY, items);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
