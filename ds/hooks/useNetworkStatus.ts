"use client";
import { useEffect, useState } from "react";

export interface NetworkStatus {
  online: boolean;
  since: Date | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    since: null,
  });

  useEffect(() => {
    const goOnline = () => setStatus({ online: true, since: new Date() });
    const goOffline = () => setStatus({ online: false, since: new Date() });

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return status;
}
