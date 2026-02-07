"use client";

import { useEffect, useState } from "react";
import { useWebSocketStore } from "@/lib/stores/websocket-store";

export function NetworkDetection() {
  const [isOnline, setIsOnline] = useState(true);
  const setConnected = useWebSocketStore((state) => state.setConnected);

  useEffect(() => {
    // Initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // When we come back online, try to reconnect WebSocket
      // This will be handled by the WebSocketManager's reconnect logic
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setConnected]);

  return null; // This component doesn't render anything, just manages state
}
