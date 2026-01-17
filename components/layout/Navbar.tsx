"use client";

import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useSearchStore } from "@/lib/stores/searchStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Wifi, WifiOff, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { connected, serverUrl, disconnect } = useConnectionStore();
  const { open } = useSearchStore();

  const handleDisconnect = () => {
    disconnect();
    router.push("/connect");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Routilux Overseer</h1>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/flows" className="text-sm font-medium hover:underline">
                Flows
              </Link>
              <Link href="/jobs" className="text-sm font-medium hover:underline">
                Jobs
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Global Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={open}
              className="gap-2"
              title="Search (Ctrl+K or Cmd+K)"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Connected</span>
                  <Badge variant="outline" className="text-xs">
                    {new URL(serverUrl).host}
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-muted-foreground">Not connected</span>
                </>
              )}
            </div>

            {connected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Change Server</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
