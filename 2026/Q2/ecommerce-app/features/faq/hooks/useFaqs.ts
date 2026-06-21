/**
 * useFaqs
 * Fetches the published FAQ list and exposes loading/error/refetch.
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { faqService } from "../services/faq.service";
import type { Faq } from "../types/faq.types";

export function useFaqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await faqService.getFaqs();
      setFaqs(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return { faqs, isLoading, error, refetch: fetchFaqs };
}
