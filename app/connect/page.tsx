"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { createAPI } from "@/lib/api";
import { configureAPI } from "@/lib/services/api-client";
import { LogoIcon } from "@/components/ui/Logo";
import { Loader2 } from "lucide-react";

export default function ConnectPage() {
  const router = useRouter();
  const {
    serverUrl,
    apiKey,
    setServerUrl,
    setApiKey,
    setConnected,
    setLastConnected,
    setServerVersion,
  } = useConnectionStore();

  const [url, setUrl] = useState(serverUrl || "http://localhost:20555");
  const [key, setKey] = useState(apiKey || "");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);

    console.log("Attempting to connect to:", url);

    try {
      // Validate URL format
      const validUrl = url.startsWith("http") ? url : `http://${url}`;

      console.log("Validated URL:", validUrl);

      setServerUrl(validUrl);
      setApiKey(key.trim() ? key.trim() : null);

      // Test connection
      const api = createAPI(validUrl, key.trim() ? key.trim() : undefined);
      console.log("Testing connection...");
      const isConnected = await api.testConnection();
      console.log("Connection result:", isConnected);

      if (isConnected) {
        // Fetch server info (version) for display
        try {
          const info = await api.getServerInfo();
          const version = info?.version ?? null;
          setServerVersion(typeof version === "string" ? version : null);
        } catch {
          setServerVersion(null);
        }
        // Configure the global API client for other components to use
        configureAPI(validUrl, key.trim() ? key.trim() : undefined);
        setConnected(true);
        setLastConnected(new Date().toISOString());
        console.log("Connected successfully, redirecting to home...");
        // Use window.location for a hard navigation that Playwright can detect
        window.location.href = "/";
      } else {
        setError("Failed to connect to server. Please check the URL and try again.");
        console.error("Connection test failed");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to connect. Please check the URL and try again.";
      setError(errorMsg);
      console.error("Connection error:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConnect();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-app p-4"
      data-testid="connect-page"
    >
      <Card className="w-full max-w-md shadow-xl" data-testid="connect-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4" data-testid="connect-logo">
            <LogoIcon size={48} />
          </div>
          <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Connect to Routilux
          </CardTitle>
          <CardDescription>
            Enter your Routilux API server address to start monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="connect-form">
            <div className="space-y-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input
                id="serverUrl"
                data-testid="connect-input-server-url"
                type="text"
                placeholder="http://localhost:20555"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={connecting}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Default: http://localhost:20555</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (optional)</Label>
              <Input
                id="apiKey"
                data-testid="connect-input-api-key"
                type="password"
                placeholder="Your API key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={connecting}
              />
              <p className="text-xs text-muted-foreground">
                Used for authenticated API + WebSocket access.
              </p>
            </div>

            {error && (
              <div
                className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                data-testid="connect-error-message"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              data-testid="connect-button-submit"
              className="w-full"
              disabled={connecting || !url.trim()}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="connect-spinner" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2 font-semibold">What is Routilux?</p>
            <p className="text-xs">
              Routilux is an event-driven workflow orchestration framework. This debugger helps you
              visualize, monitor, and debug your workflows in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
