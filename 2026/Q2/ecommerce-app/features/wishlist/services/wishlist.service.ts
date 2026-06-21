/**
 * Wishlist Service — pure API calls. Each mutation returns the full updated list.
 */

import { networkService } from "@/services";
import type { Product } from "@/features/products/types/product.types";
import type { ApiResponse } from "@/types/api.types";

export const wishlistService = {
  getWishlist: (): Promise<ApiResponse<Product[]>> =>
    networkService.get<Product[]>("/wishlist", undefined, { cache: false }),

  addToWishlist: (productId: string): Promise<ApiResponse<Product[]>> =>
    networkService.post<Product[]>("/wishlist", { productId }, { cache: false }),

  removeFromWishlist: (productId: string): Promise<ApiResponse<Product[]>> =>
    networkService.delete<Product[]>(`/wishlist/${productId}`, { cache: false }),
};
