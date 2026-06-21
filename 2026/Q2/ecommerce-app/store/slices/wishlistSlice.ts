/**
 * Wishlist Slice
 * Mirrors the per-user backend wishlist. Hydrated from GET /wishlist; mutations
 * replace the list with the server's authoritative response.
 */

import type { Product } from "@/features/products/types/product.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: Product[];
  ids: string[];
  isLoading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: WishlistState = {
  items: [],
  ids: [],
  isLoading: false,
  error: null,
  loaded: false,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.ids = action.payload.map((p) => p.id);
      state.isLoading = false;
      state.loaded = true;
      state.error = null;
    },
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWishlistError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetWishlist: (state) => {
      state.items = [];
      state.ids = [];
      state.loaded = false;
      state.error = null;
    },
  },
});

export const {
  setWishlist,
  setWishlistLoading,
  setWishlistError,
  resetWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
