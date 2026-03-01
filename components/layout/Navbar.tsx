"use client";

import { useMemo } from "react";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useSearchStore } from "@/lib/stores/searchStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/Logo";
import { Settings, Wifi, WifiOff, Search, Activity, Users, Zap, Cpu, Puzzle } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { connected, serverUrl, connectionDisplayName, disconnect } = useConnectionStore();
  const { open } = useSearchStore();

  const handleDisconnect = () => {
    disconnect();
    router.push("/connect");
  };

  const navLinks = useMemo(
    () => [
      { href: "/flows", label: "Flows", icon: Activity },
      { href: "/workers", label: "Workers", icon: Users },
      { href: "/jobs", label: "Jobs", icon: Zap },
      { href: "/runtimes", label: "Runtimes", icon: Cpu },
      { href: "/plugins", label: "Plugins", icon: Puzzle },
    ],
    []
  );

  const isActive = useMemo(
    () => (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      data-testid="navbar"
    >
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              prefetch={false}
              data-testid="nav-link-home"
            >
              <Logo size="sm" showText={true} />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1" data-testid="nav-links">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  data-testid={`nav-link-${label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
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
              data-testid="nav-button-search"
              title="Search (Ctrl+K or Cmd+K)"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm" data-testid="nav-connection-status">
              {connected ? (
                <>
                  <div
                    className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
                    data-testid="nav-status-connected"
                  >
                    <Wifi className="h-4 w-4" />
                    <span className="hidden sm:inline">Connected</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-mono"
                    data-testid="nav-server-badge"
                    title={serverUrl}
                  >
                    {connectionDisplayName || (serverUrl ? new URL(serverUrl).host : "")}
                  </Badge>
                </>
              ) : (
                <div
                  className="flex items-center gap-1.5 text-muted-foreground"
                  data-testid="nav-status-disconnected"
                >
                  <WifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Not connected</span>
                </div>
              )}
            </div>

            {connected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
                data-testid="nav-button-settings"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
