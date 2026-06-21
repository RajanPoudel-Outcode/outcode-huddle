/**
 * useContentPage
 * Fetches a single content page (terms / privacy) by type.
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { legalService } from "../services/legal.service";
import type { ContentPage, ContentPageType } from "../types/legal.types";

export function useContentPage(type?: ContentPageType) {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!type) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await legalService.getPage(type);
      setPage(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { page, isLoading, error, refetch: fetchPage };
}
