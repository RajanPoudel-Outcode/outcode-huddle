/**
 * useProducts
 * Fetches a product list for the given query and exposes loading/error/pagination.
 * Re-fetches when the serialized query changes.
 */

import type { ApiPagination } from "@/types/api.types";
import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { productsService } from "../services/products.service";
import type { Product, ProductQuery } from "../types/product.types";

export function useProducts(query?: ProductQuery) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(query ?? {});

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsService.getProducts(query);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, pagination, isLoading, error, refetch: fetchProducts };
}
