"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  /** Use gradient background like homepage */
  gradient?: boolean;
  /** Full height layout (no scrollbar on body, content manages its own scroll) */
  fullHeight?: boolean;
  /** Additional className for the main content container */
  className?: string;
  /** Whether to include container wrapper */
  container?: boolean;
  /** Padding configuration */
  padding?: boolean;
}

export function PageLayout({
  children,
  gradient = true,
  fullHeight = false,
  className,
  container = true,
  padding = true,
}: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", gradient && "bg-app")}>
      <Navbar />
      <main
        className={cn(
          "flex-1",
          fullHeight && "min-h-0 overflow-hidden",
          !fullHeight && "overflow-auto"
        )}
      >
        {container ? (
          <div
            className={cn(
              "w-full",
              padding && "px-4 py-6",
              fullHeight && "h-full flex flex-col",
              className
            )}
          >
            {children}
          </div>
        ) : (
          <div className={cn(fullHeight && "h-full", className)}>{children}</div>
        )}
      </main>
    </div>
  );
}

/**
 * Page header with consistent styling
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export function PageHeader({ title, description, actions, backLink }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backLink && (
        <a
          href={backLink.href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLink.label}
        </a>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
