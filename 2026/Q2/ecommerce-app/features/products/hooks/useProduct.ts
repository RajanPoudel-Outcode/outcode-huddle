/**
 * useProduct
 * Fetches a single product's detail by id.
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { productsService } from "../services/products.service";
import type { Product } from "../types/product.types";

export function useProduct(id?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsService.getProductById(id);
      setProduct(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
}
