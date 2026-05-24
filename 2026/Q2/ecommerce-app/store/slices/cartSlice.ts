/**
 * Cart Slice
 * Handle shopping cart state
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      calculateTotals(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
      calculateTotals(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload.productId,
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }

      calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      calculateTotals(state);
    },
  },
});

/**
 * Calculate cart total and item count
 */
function calculateTotals(state: CartState): void {
  state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } =
  cartSlice.actions;

export default cartSlice.reducer;
