/**
 * useCategories — fetches the dynamic category list for the home grid.
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { categoriesService } from "../services/categories.service";
import type { Category } from "../types/category.types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesService.getCategories();
      setCategories(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}
