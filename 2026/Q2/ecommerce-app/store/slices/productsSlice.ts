/**
 * Products Slice
 * Handle product catalog and filtering
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: "popular" | "price-low" | "price-high" | "newest" | "rating";
}

interface ProductsState {
  items: Product[];
  filteredItems: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
}

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  selectedProduct: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  page: 1,
  pageSize: 20,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (
      state,
      action: PayloadAction<{ items: Product[]; total: number }>,
    ) => {
      state.items = action.payload.items;
      state.totalCount = action.payload.total;
      state.isLoading = false;
      state.error = null;
      applyFilters(state);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload;
      state.page = 1;
      applyFilters(state);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.unshift(action.payload);
      state.totalCount += 1;
      applyFilters(state);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        applyFilters(state);
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.totalCount -= 1;
      applyFilters(state);
    },
  },
});

/**
 * Apply filters to products
 */
function applyFilters(state: ProductsState): void {
  let filtered = [...state.items];

  // Filter by category
  if (state.filters.category) {
    filtered = filtered.filter((p) => p.category === state.filters.category);
  }

  // Filter by price
  if (state.filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= state.filters.minPrice!);
  }
  if (state.filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= state.filters.maxPrice!);
  }

  // Filter by search query
  if (state.filters.searchQuery) {
    const query = state.filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    );
  }

  // Sort
  switch (state.filters.sortBy) {
    case "price-low":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      // Assume products are already sorted by newest
      break;
    case "popular":
      filtered.sort((a, b) => b.reviews - a.reviews);
      break;
  }

  state.filteredItems = filtered;
}

export const {
  setProducts,
  setSelectedProduct,
  setFilters,
  setLoading,
  setError,
  setPage,
  addProduct,
  updateProduct,
  removeProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
