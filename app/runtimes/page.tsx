"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnectionStore } from "@/lib/stores/connectionStore";
import { useRuntimeStore } from "@/lib/stores/runtimeStore";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plug, RefreshCw, Cpu } from "lucide-react";
import { createAPI } from "@/lib/api";

export default function RuntimesPage() {
  const router = useRouter();
  const { connected, serverUrl } = useConnectionStore();
  const { runtimes, defaultRuntimeId, loadRuntimes, loading, error } = useRuntimeStore();
  const [creating, setCreating] = useState(false);
  const [runtimeId, setRuntimeId] = useState("");
  const [threadPoolSize, setThreadPoolSize] = useState("10");
  const [isDefault, setIsDefault] = useState("false");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (serverUrl && connected) {
      loadRuntimes(serverUrl);
    }
  }, [serverUrl, connected, loadRuntimes]);

  const runtimeList = useMemo(() => Array.from(runtimes.values()), [runtimes]);

  const handleCreate = async () => {
    if (!serverUrl || !runtimeId.trim()) return;
    setCreating(true);
    setFormError(null);
    try {
      const api = createAPI(serverUrl);
      const parsedSize = Number.parseInt(threadPoolSize, 10);
      if (!Number.isFinite(parsedSize) || parsedSize < 0) {
        throw new Error("Thread pool size must be 0 or a positive integer.");
      }
      await api.runtimes.create({
        runtime_id: runtimeId.trim(),
        thread_pool_size: parsedSize,
        is_default: isDefault === "true",
      });
      setRuntimeId("");
      setThreadPoolSize("10");
      setIsDefault("false");
      await loadRuntimes(serverUrl);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Failed to create runtime.");
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    if (!serverUrl) return;
    await loadRuntimes(serverUrl);
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col bg-app">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Not Connected
              </CardTitle>
              <CardDescription>
                Connect to a Routilux server to manage runtimes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/connect")} className="w-full">
                Connect to Server
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <div className="w-full px-4 py-6 flex-1 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Runtimes</h1>
            <p className="text-muted-foreground">
              Manage execution runtimes and capacity.
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Registered Runtimes
              </CardTitle>
              <CardDescription>
                Default runtime: {defaultRuntimeId || "not set"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading runtimes...
                </div>
              ) : error ? (
                <div className="text-sm text-destructive">{error.message}</div>
              ) : runtimeList.length === 0 ? (
                <div className="text-sm text-muted-foreground">No runtimes found.</div>
              ) : (
                <div className="space-y-3">
                  {runtimeList.map((runtime) => (
                    <div key={runtime.runtime_id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm">{runtime.runtime_id}</div>
                        <span className="text-xs text-muted-foreground">
                          {runtime.is_default ? "Default" : "Custom"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Thread pool: {runtime.thread_pool_size}</div>
                        <div>Active jobs: {runtime.active_job_count}</div>
                        <div>Status: {runtime.is_shutdown ? "Shutdown" : "Healthy"}</div>
                        <div>Default: {runtime.is_default ? "Yes" : "No"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Runtime</CardTitle>
              <CardDescription>
                Register a new runtime instance for job execution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Runtime ID</Label>
                <Input
                  value={runtimeId}
                  onChange={(event) => setRuntimeId(event.target.value)}
                  placeholder="production"
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label>Thread Pool Size</Label>
                <Input
                  type="number"
                  min="0"
                  value={threadPoolSize}
                  onChange={(event) => setThreadPoolSize(event.target.value)}
                  disabled={creating}
                />
                <p className="text-xs text-muted-foreground">
                  Use 0 to fall back to the global job manager pool.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Set as Default</Label>
                <Select value={isDefault} onValueChange={setIsDefault} disabled={creating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default behavior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <Button onClick={handleCreate} disabled={creating || !runtimeId.trim()} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Runtime"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
