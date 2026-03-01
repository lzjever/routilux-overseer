"use client";

import { useConnectionStore } from "@/lib/stores/connectionStore";
import { getAPI } from "@/lib/services/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";
import { useState } from "react";

export function ConnectionLostBanner() {
  const { connected, connectionLost, setConnectionLost } = useConnectionStore();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const api = getAPI();
      await api.health.readiness();
      setConnectionLost(false);
    } catch {
      // Keep banner visible
    } finally {
      setRetrying(false);
    }
  };

  if (!connected || !connectionLost) return null;

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-center gap-3 bg-amber-500/90 dark:bg-amber-600/90 px-4 py-2 text-sm font-medium text-amber-950 dark:text-amber-100"
      data-testid="connection-lost-banner"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Connection lost.</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleRetry}
        disabled={retrying}
        className="h-7 shrink-0"
        data-testid="connection-lost-retry"
      >
        {retrying ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </>
        )}
      </Button>
      <Link
        href="/connect"
        className="text-amber-950 dark:text-amber-100 underline underline-offset-2 hover:no-underline"
        data-testid="connection-lost-reconnect"
      >
        Reconnect
      </Link>
    </div>
  );
}
