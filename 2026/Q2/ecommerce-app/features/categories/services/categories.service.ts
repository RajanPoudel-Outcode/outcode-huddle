/**
 * Categories Service — pure API calls.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type { Category } from "../types/category.types";

export const categoriesService = {
  getCategories: (): Promise<ApiResponse<Category[]>> =>
    networkService.get<Category[]>("/categories", undefined, {
      cache: true,
      cacheTTL: 3600000,
    }),
};
