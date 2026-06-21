/**
 * Products Service
 * Pure API calls. All list-style queries go through GET /products with query
 * params (category / search / featured), which returns a consistent paginated
 * envelope (data: Product[], pagination).
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type { Product, ProductQuery } from "../types/product.types";

export const productsService = {
  getProducts: (params?: ProductQuery): Promise<ApiResponse<Product[]>> =>
    networkService.get<Product[]>(
      "/products",
      params as Record<string, unknown> | undefined,
      { cache: false },
    ),

  getProductById: (id: string): Promise<ApiResponse<Product>> =>
    networkService.get<Product>(`/products/${id}`, undefined, { cache: false }),
};
