"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { createAPI } from "@/lib/api";
import { Logo, LogoIcon } from "@/components/ui/Logo";
import { Loader2 } from "lucide-react";

export default function ConnectPage() {
  const router = useRouter();
  const { serverUrl, setServerUrl, setConnected, setLastConnected } =
    useConnectionStore();

  const [url, setUrl] = useState(serverUrl || "http://localhost:20555");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    setConnecting(true);

    console.log("Attempting to connect to:", url);

    try {
      // Validate URL format
      const validUrl = url.startsWith("http")
        ? url
        : `http://${url}`;

      console.log("Validated URL:", validUrl);

      setServerUrl(validUrl);

      // Test connection
      const api = createAPI(validUrl);
      console.log("Testing connection...");
      try {
        const isConnected = await api.testConnection();
        console.log("Connection result:", isConnected);

        if (isConnected) {
          setConnected(true);
          setLastConnected(new Date().toISOString());
          console.log("Connected successfully, redirecting to home...");
          router.push("/");
        } else {
          setError("Failed to connect to server. Please check the URL and try again.");
          console.error("Connection test failed");
        }
      } catch (testError: any) {
        // This will be caught by outer catch block, but we can provide more context
        throw testError;
      }
    } catch (err) {
      const errorMsg = err instanceof Error
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl">Server URL</Label>
              <Input
                id="serverUrl"
                type="text"
                placeholder="http://localhost:20555"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={connecting}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Default: http://localhost:20555
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={connecting || !url.trim()}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              Routilux is an event-driven workflow orchestration framework.
              This debugger helps you visualize, monitor, and debug your
              workflows in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
