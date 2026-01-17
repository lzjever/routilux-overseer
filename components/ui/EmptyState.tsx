"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  illustration?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
}: EmptyStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon ? (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-2">
        {action && (
          <>
            {action.href ? (
              <Link href={action.href}>
                <Button>{action.label}</Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )}
          </>
        )}
        {secondaryAction && (
          <>
            {secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return <CardContent>{content}</CardContent>;
}
