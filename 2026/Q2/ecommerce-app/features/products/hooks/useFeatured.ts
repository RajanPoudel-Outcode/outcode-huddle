/**
 * useFeatured
 * Convenience hook for the "Flash Deals" / popular row (curated isFeatured).
 */

import { useProducts } from "./useProducts";

export function useFeatured(limit = 10) {
  return useProducts({ featured: true, limit });
}
