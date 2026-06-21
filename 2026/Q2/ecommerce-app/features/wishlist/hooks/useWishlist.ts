/**
 * useWishlist
 * Reads the wishlist from Redux and exposes toggle/isWishlisted. Auto-hydrates
 * once when authenticated; mutations sync with the backend's response.
 */

import type { Product } from "@/features/products/types/product.types";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import {
  setWishlist,
  setWishlistError,
  setWishlistLoading,
} from "@/store/slices/wishlistSlice";
import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect } from "react";
import { wishlistService } from "../services/wishlist.service";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s: RootState) => s.wishlist.items);
  const ids = useAppSelector((s: RootState) => s.wishlist.ids);
  const isLoading = useAppSelector((s: RootState) => s.wishlist.isLoading);
  const error = useAppSelector((s: RootState) => s.wishlist.error);
  const loaded = useAppSelector((s: RootState) => s.wishlist.loaded);
  const isAuthenticated = useAppSelector(
    (s: RootState) => s.auth.isAuthenticated,
  );

  const reload = useCallback(async () => {
    dispatch(setWishlistLoading(true));
    try {
      const res = await wishlistService.getWishlist();
      dispatch(setWishlist(res.data));
    } catch (err) {
      dispatch(setWishlistError(ErrorHandler.getUserMessage(err)));
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !loaded) {
      reload();
    }
  }, [isAuthenticated, loaded, reload]);

  const toggle = useCallback(
    async (product: Product) => {
      try {
        const res = ids.includes(product.id)
          ? await wishlistService.removeFromWishlist(product.id)
          : await wishlistService.addToWishlist(product.id);
        dispatch(setWishlist(res.data));
      } catch (err) {
        dispatch(setWishlistError(ErrorHandler.getUserMessage(err)));
      }
    },
    [ids, dispatch],
  );

  const isWishlisted = useCallback((id: string) => ids.includes(id), [ids]);

  return { items, ids, isLoading, error, toggle, isWishlisted, reload };
}
