"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, PauseCircle } from "lucide-react";
import { createAPI } from "@/lib/api";
import type { DebugSessionInfo } from "@/lib/types/api";

interface DebugSessionMonitorProps {
  jobId: string;
  serverUrl: string;
}

export function DebugSessionMonitor({ jobId, serverUrl }: DebugSessionMonitorProps) {
  const [session, setSession] = useState<DebugSessionInfo | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const api = createAPI(serverUrl);
        const sessionData = await api.debug.getSession(jobId);

        // Convert DebugSessionResponse to DebugSessionInfo
        const debugSessionInfo: DebugSessionInfo = {
          session_id: sessionData.session_id,
          job_id: sessionData.job_id,
          status: sessionData.status as "running" | "paused" | "stepping",
          paused_at: sessionData.paused_at,
          call_stack_depth: sessionData.call_stack_depth,
        };

        setSession(debugSessionInfo);
      } catch (error) {
        console.error("Failed to load debug session:", error);
      }
    };

    loadSession();
    const interval = setInterval(loadSession, 2000);
    return () => clearInterval(interval);
  }, [jobId, serverUrl]);

  if (!session) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Debug Session</AlertTitle>
        <AlertDescription>
          Debug session will start when breakpoint is hit
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant={session.status === "paused" ? "default" : "secondary"}>
            {session.status}
          </Badge>
          Debug Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Session ID</Label>
            <p className="text-sm font-mono">{session.session_id}</p>
          </div>
          <div>
            <Label>Call Stack Depth</Label>
            <p className="text-sm">{session.call_stack_depth}</p>
          </div>
        </div>

        {session.paused_at && (
          <Alert>
            <PauseCircle className="h-4 w-4" />
            <AlertTitle>Paused at {session.paused_at.routine_id}</AlertTitle>
            {session.paused_timestamp && (
              <AlertDescription>
                {new Date(session.paused_timestamp).toLocaleString()}
              </AlertDescription>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
