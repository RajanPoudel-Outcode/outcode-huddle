/**
 * useWishlist
 * Local-state hook for the Wishlist screen: fetches the user's wishlisted
 * products and exposes reload + a helper to drop an item locally (the heart on
 * a card already performs the API call). Heart state elsewhere comes from each
 * product's server-provided `isWishlisted` flag, so no global store is needed.
 */

import type { Product } from "@/features/products/types/product.types";
import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useState } from "react";
import { wishlistService } from "../services/wishlist.service";

export function useWishlist() {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await wishlistService.getWishlist();
      setItems(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Remove an item from the local list (card already called the API). */
  const dropItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  return { items, isLoading, error, reload, dropItem };
}
