"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Play, MoreVertical, Download, Upload, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import type { FlowResponse } from "@/lib/types/api";

interface FlowDetailHeaderProps {
  flow: FlowResponse;
  flowId: string;
  serverUrl?: string;
  validationStatus?: {
    valid: boolean;
    errors?: string[];
  } | null;
  jobCount?: number | null;
  onStartJob: () => void;
  onExportDSL: () => void;
  onRefresh: () => void;
  onValidate?: () => void;
}

export function FlowDetailHeader({
  flow,
  flowId,
  serverUrl,
  validationStatus,
  jobCount,
  onStartJob,
  onExportDSL,
  onRefresh,
  onValidate,
}: FlowDetailHeaderProps) {
  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href="/flows">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl font-bold truncate">{flow.flow_id}</h1>
          
          {/* Validation Status Badge */}
          {validationStatus && (
            <Badge
              variant={validationStatus.valid ? "secondary" : "destructive"}
              className="h-5 text-xs cursor-pointer"
              onClick={onValidate}
            >
              {validationStatus.valid ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valid
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Invalid
                </>
              )}
            </Badge>
          )}
          
          {/* Jobs Link */}
          {serverUrl && jobCount !== null && (
            <Link href={`/jobs?flowId=${flowId}`}>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                {jobCount} job{jobCount !== 1 ? "s" : ""}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportDSL}>
              <Download className="mr-2 h-4 w-4" />
              Export DSL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRefresh}>
              <Upload className="mr-2 h-4 w-4" />
              Refresh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button onClick={onStartJob} size="sm" className="h-8">
          <Play className="mr-2 h-3 w-3" />
          Start Job
        </Button>
      </div>
    </div>
  );
}
