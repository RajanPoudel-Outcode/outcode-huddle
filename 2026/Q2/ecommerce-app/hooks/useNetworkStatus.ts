/**
 * Network Status Hook
 * Track online/offline status
 */

import { useEffect, useState } from "react";

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Listen for online event
    const handleOnline = () => setIsOnline(true);
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
    }

    // Listen for offline event
    const handleOffline = () => setIsOnline(false);
    if (typeof window !== "undefined") {
      window.addEventListener("offline", handleOffline);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  return isOnline;
}
