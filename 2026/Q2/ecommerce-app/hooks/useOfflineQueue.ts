/**
 * Offline Queue Hook
 * Manage queued offline requests
 */

import { networkService, storageService } from "@/services";
import { useCallback, useEffect, useState } from "react";

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  retries: number;
}

export function useOfflineQueue() {
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueuedRequests = useCallback(async () => {
    try {
      const requests = await storageService.getQueuedRequests();
      setQueuedRequests(requests);
    } catch (error) {
      console.error("Failed to load queued requests", error);
    }
  }, []);

  const retryAll = useCallback(async () => {
    if (!networkService.isConnected()) {
      console.warn("Cannot retry: offline");
      return;
    }

    setIsSyncing(true);
    try {
      await loadQueuedRequests();
    } finally {
      setIsSyncing(false);
    }
  }, [loadQueuedRequests]);

  useEffect(() => {
    loadQueuedRequests();

    // Refresh queued requests every 5 seconds
    const interval = setInterval(loadQueuedRequests, 5000);
    return () => clearInterval(interval);
  }, [loadQueuedRequests]);

  return {
    queuedRequests,
    isSyncing,
    retryAll,
    refresh: loadQueuedRequests,
  };
}
