/**
 * useSupportRequests
 * Loads the current user's support requests and exposes a create action that
 * optimistically prepends the new request to the list.
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { supportService } from "../services/support.service";
import type { CreateSupportPayload, SupportRequest } from "../types/support.types";

export function useSupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supportService.getMyRequests();
      setRequests(res.data);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: CreateSupportPayload) => {
    setIsSubmitting(true);
    try {
      const res = await supportService.createRequest(data);
      setRequests((prev) => [res.data, ...prev]);
      return res.data;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, isLoading, error, isSubmitting, createRequest, refetch: fetchRequests };
}
