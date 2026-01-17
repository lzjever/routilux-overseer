"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorInfo {
  title?: string;
  message: string;
  status?: number;
  errorId?: string;
  retry?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  details?: string;
}

interface ErrorDisplayProps {
  error: ErrorInfo | Error | string | null;
  className?: string;
  onDismiss?: () => void;
  variant?: "default" | "destructive" | "warning";
}

export function ErrorDisplay({ error, className, onDismiss, variant = "destructive" }: ErrorDisplayProps) {
  if (!error) return null;

  // Normalize error to ErrorInfo
  let errorInfo: ErrorInfo;
  if (typeof error === "string") {
    errorInfo = { message: error };
  } else if (error instanceof Error) {
    errorInfo = {
      title: "Error",
      message: error.message,
      details: error.stack,
    };
  } else {
    errorInfo = error;
  }

  // Determine error category based on status
  const getErrorCategory = (status?: number): { title: string; description: string; action?: string } => {
    switch (status) {
      case 400:
        return {
          title: "Bad Request",
          description: "The request was invalid. Please check your input and try again.",
        };
      case 401:
        return {
          title: "Unauthorized",
          description: "You are not authorized to perform this action. Please check your credentials.",
        };
      case 403:
        return {
          title: "Forbidden",
          description: "You don't have permission to access this resource.",
        };
      case 404:
        return {
          title: "Not Found",
          description: "The requested resource was not found. It may have been deleted or moved.",
          action: "Go back or refresh the page",
        };
      case 408:
        return {
          title: "Request Timeout",
          description: "The request took too long to complete. Please try again.",
        };
      case 429:
        return {
          title: "Too Many Requests",
          description: "You've made too many requests. Please wait a moment and try again.",
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: "Server Error",
          description: "The server encountered an error. Please try again later or contact support if the problem persists.",
          action: errorInfo.errorId ? `Error ID: ${errorInfo.errorId}` : undefined,
        };
      default:
        return {
          title: errorInfo.title || "Error",
          description: errorInfo.message,
        };
    }
  };

  const category = getErrorCategory(errorInfo.status);
  const isNetworkError = !errorInfo.status || errorInfo.status === 0;

  return (
    <Alert
      variant={variant}
      className={cn("relative", className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{category.title}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{category.description || errorInfo.message}</p>
        
        {isNetworkError && (
          <p className="text-sm text-muted-foreground">
            This might be a network connectivity issue. Please check your connection and try again.
          </p>
        )}

        {category.action && (
          <p className="text-sm font-medium">{category.action}</p>
        )}

        {errorInfo.details && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Show details
            </summary>
            <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
              {errorInfo.details}
            </pre>
          </details>
        )}

        <div className="flex items-center gap-2 pt-2">
          {errorInfo.retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={errorInfo.retry}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
          {errorInfo.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={errorInfo.action.onClick}
              className="gap-2"
            >
              {errorInfo.action.label}
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          {errorInfo.status === 404 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              Go Back
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
