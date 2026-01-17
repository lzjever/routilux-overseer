"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Play, Pause, XCircle, RefreshCw, Bug, Wifi, MoreVertical } from "lucide-react";
import Link from "next/link";
import type { JobResponse } from "@/lib/types/api";

interface JobDetailHeaderProps {
  job: JobResponse;
  serverUrl?: string;
  onRefresh: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onToggleDebug?: () => void;
  debugSidebarOpen?: boolean;
  actionLoading?: boolean;
  wsConnected?: boolean;
}

export function JobDetailHeader({
  job,
  serverUrl,
  onRefresh,
  onPause,
  onResume,
  onCancel,
  onToggleDebug,
  debugSidebarOpen = false,
  actionLoading = false,
  wsConnected = false,
}: JobDetailHeaderProps) {
  const isRunning = job.status === "running";
  const isPaused = job.status === "paused";

  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl font-bold truncate font-mono">{job.job_id}</h1>

          <span className="text-muted-foreground">•</span>

          <p className="text-sm text-muted-foreground truncate">
            Flow: {job.flow_id}
          </p>

          <span className="text-muted-foreground">•</span>

          <Badge
            variant={
              isRunning
                ? "default"
                : isPaused
                ? "secondary"
                : job.status === "completed"
                ? "secondary"
                : job.status === "failed"
                ? "destructive"
                : "outline"
            }
            className="h-5 text-xs"
          >
            {job.status}
          </Badge>

          {wsConnected && (
            <>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRefresh}
          disabled={actionLoading}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${actionLoading ? "animate-spin" : ""}`} />
        </Button>

        {onToggleDebug && (
          <Button
            variant={debugSidebarOpen ? "default" : "outline"}
            size="sm"
            onClick={onToggleDebug}
            className="h-8"
          >
            <Bug className="mr-2 h-3 w-3" />
            Debug
            {debugSidebarOpen && " Panel"}
          </Button>
        )}

        {isRunning && onPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            disabled={actionLoading}
            className="h-8"
          >
            <Pause className="mr-2 h-3 w-3" />
            Pause
          </Button>
        )}

        {isPaused && onResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResume}
            disabled={actionLoading}
            className="h-8"
          >
            <Play className="mr-2 h-3 w-3" />
            Resume
          </Button>
        )}

        {(isRunning || isPaused) && onCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
            disabled={actionLoading}
            className="h-8"
          >
            <XCircle className="mr-2 h-3 w-3" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
